"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { PDFDocumentProxy } from "pdfjs-dist";
import CustomCursor from "@/components/CustomCursor";
import { applyPdfiumObjectChanges, applyPdfiumTextChanges, locatePdfiumPageObjects, locatePdfiumText, type PdfiumPageObject, type PdfiumTextTarget } from "./pdfium-engine";
import styles from "./pdf-editor.module.css";

type EditMode = "select" | "text" | "erase" | "move" | "pan";
type PdfEdit = {
  id: number;
  page: number;
  kind: "text" | "cover" | "replace" | "move" | "erase";
  x: number;
  y: number;
  width?: number;
  height?: number;
  sourceRunId?: string;
  sourceObjectIndex?: number;
  sourceText?: string;
  sourceBounds?: PdfiumTextTarget["bounds"];
  moveDx?: number;
  moveDy?: number;
  scale?: number;
  text?: string;
  fontSize?: number;
  font?: string;
  color?: string;
  bold?: boolean;
};

type PdfTextRun = {
  id: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontFamily: string;
  fontSize: number;
  bold: boolean;
};

type EditHistory = { past: PdfEdit[][]; present: PdfEdit[]; future: PdfEdit[][] };
let pdfJsRuntimeInfo: {
  version: string;
  workerPath: string;
  basePath: string;
  readableStreamAsyncIteratorPolyfilled: boolean;
} | null = null;

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const MIN_PREVIEW_ZOOM = 0.75;
const MAX_PREVIEW_ZOOM = 2.5;
const RESIZE_CORNERS = ["top-left", "top-right", "bottom-left", "bottom-right"] as const;

async function loadPdfJs() {
  const compatibility = await import("./pdfjs-compat");
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const nextScript = Array.from(document.scripts).find((script) =>
    new URL(script.src, window.location.href).pathname.includes("/_next/static/chunks/"),
  );
  const basePath = nextScript
    ? new URL(nextScript.src, window.location.href).pathname.split("/_next/")[0]
    : "";
  const workerBootstrapUrl = new URL(`${basePath}/pdfjs-worker-compat.mjs`, window.location.origin);
  workerBootstrapUrl.searchParams.set("src", `${basePath}/pdfjs-worker.mjs`);
  pdfjs.GlobalWorkerOptions.workerSrc = workerBootstrapUrl.toString();
  pdfJsRuntimeInfo = {
    version: pdfjs.version,
    workerPath: workerBootstrapUrl.pathname,
    basePath,
    readableStreamAsyncIteratorPolyfilled: compatibility.readableStreamAsyncIteratorPolyfilled,
  };
  return pdfjs;
}

async function openPdfDocument(bytes: Uint8Array) {
  const pdfjs = await loadPdfJs();
  const basePath = pdfJsRuntimeInfo?.basePath ?? "";
  const assetUrl = (directory: string) => new URL(`${basePath}/pdfjs-${directory}/`, window.location.origin).toString();
  return pdfjs.getDocument({
    data: new Uint8Array(bytes),
    cMapUrl: assetUrl("cmaps"),
    cMapPacked: true,
    iccUrl: assetUrl("iccs"),
    standardFontDataUrl: assetUrl("standard-fonts"),
    wasmUrl: assetUrl("wasm"),
    useWorkerFetch: true,
  }).promise;
}

function normalizePdfText(value: string) {
  return value.normalize("NFKC").replace(/\s+/g, "").toLocaleLowerCase();
}

function normalizeDownloadName(value: string) {
  const cleaned = value.trim()
    .replace(/(\.pdf)+$/i, "")
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
    .replace(/[. ]+$/g, "");
  return cleaned || "edited-document";
}

async function verifyReplacementText(pdf: PDFDocumentProxy, replacements: PdfEdit[]) {
  const pages = new Map<number, { text: string; items: Array<{ str: string; left: number; top: number; width: number; height: number }> }>();
  for (const edit of replacements) {
    if (!edit.text?.trim()) continue;
    let pageData = pages.get(edit.page);
    if (!pageData) {
      const pdfPage = await pdf.getPage(edit.page);
      const viewport = pdfPage.getViewport({ scale: 1 });
      const content = await pdfPage.getTextContent();
      const items = content.items.flatMap((item) => {
        if (!("str" in item) || !item.str.trim()) return [];
        const [left, baseline] = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
        return [{
          str: item.str,
          left: left / viewport.width,
          top: (baseline - item.height) / viewport.height,
          width: item.width / viewport.width,
          height: item.height / viewport.height,
        }];
      });
      pageData = { text: normalizePdfText(items.map((item) => item.str).join(" ")), items };
      pages.set(edit.page, pageData);
    }
    const targetX = edit.x + (edit.width ?? 0) / 2;
    const targetY = edit.y + (edit.height ?? 0) / 2;
    const xTolerance = Math.max(.025, (edit.width ?? 0) / 2 + .015);
    const yTolerance = Math.max(.02, (edit.height ?? 0) / 2 + .015);
    const replacementAtSource = pageData.items.some((item) => {
      const centerX = item.left + item.width / 2;
      const centerY = item.top + item.height / 2;
      return Math.abs(centerX - targetX) <= xTolerance
        && Math.abs(centerY - targetY) <= yTolerance
        && normalizePdfText(item.str).includes(normalizePdfText(edit.text ?? ""));
    });
    if (!pageData.text.includes(normalizePdfText(edit.text)) || !replacementAtSource) {
      throw new Error(`The edited PDF did not place â€œ${edit.text}â€ at the selected text position on page ${edit.page}; the original was kept unchanged.`);
    }
  }
}

function pointFromEvent(event: React.PointerEvent<HTMLDivElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  return {
    x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
    y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
  };
}

function pointFromStage(event: React.PointerEvent, stage: HTMLDivElement) {
  const rect = stage.getBoundingClientRect();
  return {
    x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
    y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
  };
}

export default function PdfEditor() {
  const inputRef = useRef<HTMLInputElement>(null);
  const fileNameInputRef = useRef<HTMLInputElement>(null);
  const inlineEditorRef = useRef<HTMLTextAreaElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRenderTaskRef = useRef<{ cancel: () => void; promise: Promise<void> } | null>(null);
  const nextIdRef = useRef(1);
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null);
  const [previewDocument, setPreviewDocument] = useState<PDFDocumentProxy | null>(null);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [fileName, setFileName] = useState("");
  const [renamingFile, setRenamingFile] = useState(false);
  const [draftFileName, setDraftFileName] = useState("");
  const [page, setPage] = useState(1);
  const [mode, setMode] = useState<EditMode>("select");
  const [history, setHistory] = useState<EditHistory>({ past: [], present: [], future: [] });
  const edits = history.present;
  const [textRuns, setTextRuns] = useState<PdfTextRun[]>([]);
  const [pageObjectsResult, setPageObjectsResult] = useState<{
    page: number;
    fileBytes: Uint8Array | null;
    objects: PdfiumPageObject[];
    error: string;
  }>({ page: 0, fileBytes: null, objects: [], error: "" });
  const pageObjects = pageObjectsResult.page === page && pageObjectsResult.fileBytes === fileBytes
    ? pageObjectsResult.objects
    : [];
  const pageObjectsError = pageObjectsResult.page === page && pageObjectsResult.fileBytes === fileBytes
    ? pageObjectsResult.error
    : "";
  const [pageSize, setPageSize] = useState({ width: 1, height: 1 });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedSourceRun, setSelectedSourceRun] = useState<PdfTextRun | null>(null);
  const [sourceTarget, setSourceTarget] = useState<PdfiumTextTarget | null>(null);
  const [fontSize, setFontSize] = useState(16);
  const [font, setFont] = useState("Helvetica");
  const [bold, setBold] = useState(false);
  const [color, setColor] = useState("#111111");
  const [coverStart, setCoverStart] = useState<{ x: number; y: number } | null>(null);
  const [coverEnd, setCoverEnd] = useState<{ x: number; y: number } | null>(null);
  const [canvasHeight, setCanvasHeight] = useState(0);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [pageScale, setPageScale] = useState(1);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [stageWidth, setStageWidth] = useState(0);
  const [dragPreview, setDragPreview] = useState<{ id: number; x: number; y: number } | null>(null);
  const dragRef = useRef<{ id: number; offsetX: number; offsetY: number } | null>(null);
  const inlineDragRef = useRef<{ id: number; startX: number; startY: number; offsetX: number; offsetY: number; dragging: boolean } | null>(null);
  const objectDragRef = useRef<{ objectIndex: number; start: { x: number; y: number }; offsetX: number; offsetY: number } | null>(null);
  const resizeGestureRef = useRef<{ editId: number; pointerId: number; startDistance: number; startFontSize: number; startScale: number; anchorX: number; anchorY: number } | null>(null);
  const activeTouchPointsRef = useRef(new Map<number, { x: number; y: number }>());
  const pendingTouchPlacementRef = useRef<{ pointerId: number; point: { x: number; y: number } } | null>(null);
  const [resizePreview, setResizePreview] = useState<{ editId: number; fontSize: number; scale: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [renderDiagnostics, setRenderDiagnostics] = useState("");

  const pageCount = document?.numPages ?? 0;
  const renderDocument = previewDocument ?? document;
  const selectedEdit = edits.find((edit) => edit.id === selectedId) ?? null;
  const editingExistingText = Boolean(selectedSourceRun || selectedEdit?.kind === "replace");
  const activeTextEdit = selectedEdit && (selectedEdit.kind === "text" || selectedEdit.kind === "replace") ? selectedEdit : null;
  const activeText = activeTextEdit?.text ?? selectedSourceRun?.text ?? "";
  const activeFontSize = activeTextEdit?.fontSize ?? sourceTarget?.fontSize ?? fontSize;
  const activeFont = activeTextEdit?.font ?? sourceTarget?.fontFamily ?? font;
  const activeColor = activeTextEdit?.color ?? sourceTarget?.color ?? color;
  const selectedRun = selectedEdit?.kind === "replace"
    ? textRuns.find((run) => run.id === selectedEdit.sourceRunId)
    : selectedSourceRun;
  const inlineReplacementRun = selectedSourceRun ?? (selectedEdit?.kind === "replace"
    ? selectedRun ?? {
      id: selectedEdit.sourceRunId ?? String(selectedEdit.id),
      page: selectedEdit.page,
      x: selectedEdit.x,
      y: selectedEdit.y,
      width: selectedEdit.width ?? .2,
      height: selectedEdit.height ?? .03,
      text: selectedEdit.sourceText ?? "",
      fontFamily: selectedEdit.font ?? font,
      fontSize: selectedEdit.fontSize ?? fontSize,
      bold: selectedEdit.bold ?? false,
    }
    : null);

  function updateEdits(change: PdfEdit[] | ((current: PdfEdit[]) => PdfEdit[])) {
    setHistory((current) => {
      const next = typeof change === "function" ? change(current.present) : change;
      if (next === current.present) return current;
      return {
        past: [...current.past.slice(-49), current.present],
        present: next,
        future: [],
      };
    });
  }

  function undo() {
    setHistory((current) => {
      if (!current.past.length) return current;
      return {
        past: current.past.slice(0, -1),
        present: current.past[current.past.length - 1],
        future: [current.present, ...current.future],
      };
    });
    setSelectedId(null);
    setSelectedSourceRun(null);
    setSourceTarget(null);
  }

  function redo() {
    setHistory((current) => {
      if (!current.future.length) return current;
      return {
        past: [...current.past, current.present],
        present: current.future[0],
        future: current.future.slice(1),
      };
    });
    setSelectedId(null);
    setSelectedSourceRun(null);
    setSourceTarget(null);
  }

  useEffect(() => {
    if (!document || !fileBytes) return;
    let cancelled = false;
    const replacementEdits = edits.filter((edit) => edit.kind === "replace");
    const objectEdits = edits.filter((edit) => edit.kind === "move" || edit.kind === "erase" || (edit.kind === "replace" && (edit.scale ?? 1) !== 1));
    if (!replacementEdits.length && !objectEdits.length) {
      const clearTimer = window.setTimeout(() => {
        setPreviewDocument(null);
        setPreviewBusy(false);
        setPreviewError("");
      }, 0);
      return () => {
        cancelled = true;
        window.clearTimeout(clearTimer);
      };
    }

    const timer = window.setTimeout(() => {
      setPreviewBusy(true);
      setPreviewError("");
      void (async () => {
        try {
          let previewBytes = replacementEdits.length ? await applyPdfiumTextChanges(fileBytes, replacementEdits.map((edit) => ({
            page: edit.page,
            objectIndex: edit.sourceObjectIndex!,
            originalText: edit.sourceText!,
            text: edit.text ?? "",
            originalBounds: edit.sourceBounds!,
          }))) : fileBytes;
          if (replacementEdits.length) {
            const textPreview = await openPdfDocument(previewBytes);
            try { await verifyReplacementText(textPreview, replacementEdits); }
            finally { await textPreview.cleanup(); }
          }
          const pageObjectChanges = await Promise.all(objectEdits.map(async (edit) => {
            const pdfPage = await document.getPage(edit.page);
            const viewport = pdfPage.getViewport({ scale: 1 });
            return {
              page: edit.page,
              objectIndex: edit.sourceObjectIndex!,
              dx: (edit.moveDx ?? 0) * viewport.width,
              dy: -(edit.moveDy ?? 0) * viewport.height,
              scale: edit.scale ?? 1,
              originX: edit.sourceBounds ? (edit.sourceBounds.left + edit.sourceBounds.right) / 2 : 0,
              originY: edit.sourceBounds ? (edit.sourceBounds.bottom + edit.sourceBounds.top) / 2 : 0,
              erase: edit.kind === "erase",
            };
          }));
          previewBytes = await applyPdfiumObjectChanges(previewBytes, pageObjectChanges);
          if (cancelled) return;
          const nextPreview = await openPdfDocument(previewBytes);
          if (cancelled) {
            void nextPreview.cleanup();
            return;
          }
          setPreviewDocument(nextPreview);
        } catch (cause) {
          if (!cancelled) {
            setPreviewDocument(null);
            setPreviewError(cause instanceof Error ? cause.message : "The edited PDF preview could not be rendered.");
          }
        } finally {
          if (!cancelled) setPreviewBusy(false);
        }
      })();
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [document, edits, fileBytes]);

  useEffect(() => {
    if (!fileBytes || !document) return;
    let cancelled = false;
    void locatePdfiumPageObjects(fileBytes, page - 1).then((objects) => {
      if (!cancelled) setPageObjectsResult({ page, fileBytes, objects, error: "" });
    }).catch((cause) => {
      if (!cancelled) setPageObjectsResult({
        page,
        fileBytes,
        objects: [],
        error: cause instanceof Error ? cause.message : "Could not inspect PDF page objects.",
      });
    });
    return () => { cancelled = true; };
  }, [fileBytes, page, document]);

  useEffect(() => {
    const activeDocument = renderDocument;
    if (!activeDocument) return;
    if (!canvasRef.current || !stageRef.current) return;
    let cancelled = false;
    let renderTask: { cancel: () => void; promise: Promise<void> } | undefined;

    async function renderPage() {
      let stage = "Opening the selected page";
      let textItemIndex = -1;
      let currentFontName = "Not reached";
      try {
        setError("");
        setRenderDiagnostics("");
        const pdfPage = await activeDocument!.getPage(page);
        if (cancelled || !canvasRef.current || !stageRef.current) return;
        stage = "Calculating the page size";
        const baseViewport = pdfPage.getViewport({ scale: 1 });
        setPageSize({ width: baseViewport.width, height: baseViewport.height });
        const availableWidth = stageWidth || stageRef.current.clientWidth;
        if (!availableWidth) return;
        const width = Math.min(availableWidth, 860) * previewZoom;
        const viewport = pdfPage.getViewport({ scale: width / baseViewport.width });
        setPageScale(width / baseViewport.width);
        stage = "Requesting text content from the PDF.js worker";
        const textContent = await pdfPage.getTextContent();
        stage = "Mapping extracted text items to their font styles";
        const extractedRuns = textContent.items.flatMap((item, index) => {
          textItemIndex = index;
          if (!("str" in item) || !item.str.trim()) return [];
          currentFontName = item.fontName;
          const [left, baseline] = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
          const itemWidth = item.width * (width / baseViewport.width);
          const itemHeight = item.height * (width / baseViewport.width);
          const fontStyle = textContent.styles[item.fontName];
          const rawFamily = (fontStyle?.fontFamily || item.fontName).replace(/^[A-Z]{6}\+/, "").trim();
          const family = /^(sans-serif|serif|monospace)$/i.test(rawFamily) || /^g_d\d+_f\d+$/i.test(rawFamily)
            ? "Unknown PDF font"
            : rawFamily;
          const id = `${page}-${index}-${Math.round(left)}-${Math.round(baseline)}`;
          return [{
            id,
            page,
            x: Math.max(0, left / viewport.width),
            y: Math.max(0, (baseline - itemHeight) / viewport.height),
            width: Math.max(.01, Math.min(1, itemWidth / viewport.width)),
            height: Math.max(.008, Math.min(.12, itemHeight / viewport.height)),
            text: item.str,
            fontFamily: family,
            fontSize: Math.max(8, Math.min(72, item.height)),
          bold: /bold|black|semibold/i.test(`${item.fontName} ${rawFamily}`),
          } satisfies PdfTextRun];
        });
        if (cancelled) return;
        setTextRuns((current) => [...current.filter((run) => run.page !== page), ...extractedRuns]);
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        const canvas = canvasRef.current;
        canvas.width = Math.ceil(viewport.width * ratio);
        canvas.height = Math.ceil(viewport.height * ratio);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        setCanvasWidth(viewport.width);
        setCanvasHeight(viewport.height);
        stage = "Starting the PDF canvas renderer";
        const previousRenderTask = activeRenderTaskRef.current;
        if (previousRenderTask) {
          previousRenderTask.cancel();
          await previousRenderTask.promise.catch(() => undefined);
        }
        if (cancelled || !canvasRef.current) return;
        renderTask = pdfPage.render({
          canvas,
          viewport: pdfPage.getViewport({ scale: (width / baseViewport.width) * ratio }),
        });
        activeRenderTaskRef.current = renderTask;
        stage = "Drawing PDF content to the screen";
        try {
          await renderTask.promise;
        } finally {
          if (activeRenderTaskRef.current === renderTask) activeRenderTaskRef.current = null;
        }
      } catch (cause) {
        if (!cancelled && !(cause instanceof Error && cause.name === "RenderingCancelledException")) {
          const errorObject = cause && typeof cause === "object" ? cause as { name?: unknown; message?: unknown; stack?: unknown } : null;
          const detail = cause instanceof Error
            ? cause.message
            : typeof cause === "string"
              ? cause
              : String(errorObject?.message ?? cause ?? "Unknown PDF rendering error.");
          const canvas = window.document.createElement("canvas");
          const context = canvas.getContext("2d");
          const diagnostics = {
            stage,
            page,
            textItemIndex,
            currentFontName,
            pdfjs: pdfJsRuntimeInfo,
            errorName: String(errorObject?.name ?? "Unknown"),
            error: detail,
            stack: typeof errorObject?.stack === "string" ? errorObject.stack.slice(0, 3000) : "Not provided by this browser",
            browser: navigator.userAgent,
            platform: navigator.platform,
            screen: `${window.screen.width}x${window.screen.height}`,
            devicePixelRatio: window.devicePixelRatio,
            capabilities: {
              promiseWithResolvers: typeof (Promise as PromiseConstructor & { withResolvers?: unknown }).withResolvers === "function",
              readableStream: typeof ReadableStream === "function",
              readableStreamGetReader: typeof ReadableStream === "function" && typeof ReadableStream.prototype.getReader === "function",
              readableStreamAsyncIterator: typeof ReadableStream === "function"
                && typeof (ReadableStream.prototype as ReadableStream & { [Symbol.asyncIterator]?: unknown })[Symbol.asyncIterator] === "function",
              readableStreamAsyncIteratorPolyfilled: pdfJsRuntimeInfo?.readableStreamAsyncIteratorPolyfilled ?? false,
              arrayFindLast: typeof Array.prototype.findLast === "function",
              canvas2d: Boolean(context),
              canvasResetTransform: typeof context?.resetTransform === "function",
              canvasSetTransform: typeof context?.setTransform === "function",
              offscreenCanvas: typeof OffscreenCanvas === "function",
            },
          };
          const diagnosticText = JSON.stringify(diagnostics, null, 2);
          console.error("[TRUDEV PDF Editor] Page render failed", diagnostics, cause);
          setRenderDiagnostics(diagnosticText);
          setError(`The PDF opened, but rendering failed while ${stage.toLowerCase()}: ${detail}`);
        }
      }
    }

    void renderPage();
    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [renderDocument, page, stageWidth, previewZoom]);

  useEffect(() => {
    if (!document || !stageRef.current) return;
    const observer = new ResizeObserver(() => {
      if (stageRef.current) setStageWidth(stageRef.current.clientWidth);
    });
    observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, [document]);

  useEffect(() => {
    if ((selectedSourceRun && sourceTarget) || selectedEdit?.kind === "replace" || selectedEdit?.kind === "text") {
      if (window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0) return;
      inlineEditorRef.current?.focus();
    }
  }, [selectedSourceRun, sourceTarget, selectedId, selectedEdit?.kind]);

  async function loadFile(file?: File) {
    if (!file) return;
    setError("");
    setRenderDiagnostics("");
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Choose a PDF file to start editing.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("This prototype supports PDFs up to 25 MB.");
      return;
    }
    setBusy(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const loaded = await openPdfDocument(bytes);
      setDocument(loaded);
      setPreviewDocument(null);
      setPreviewError("");
      setFileBytes(bytes);
      setFileName(file.name);
      setRenamingFile(false);
      setDraftFileName("");
      setPage(1);
      setPreviewZoom(1);
      setHistory({ past: [], present: [], future: [] });
      setTextRuns([]);
      setPageObjectsResult({ page: 0, fileBytes: null, objects: [], error: "" });
      setSelectedId(null);
      setSelectedSourceRun(null);
      setSourceTarget(null);
      setMode("select");
    } catch (cause) {
      const detail = cause instanceof Error ? cause.message : "Unknown PDF loading error.";
      setError(`We could not open that PDF: ${detail}`);
    } finally {
      setBusy(false);
    }
  }

  function beginRenameFile() {
    setDraftFileName(fileName.replace(/(\.pdf)+$/i, ""));
    setRenamingFile(true);
    window.setTimeout(() => fileNameInputRef.current?.focus(), 0);
  }

  function commitRenameFile() {
    setFileName(`${normalizeDownloadName(draftFileName)}.pdf`);
    setRenamingFile(false);
  }

  function addTextAt(point: { x: number; y: number }) {
    const id = nextIdRef.current++;
    updateEdits((current) => [...current, {
      id, page, kind: "text", x: point.x, y: point.y,
      text: "", fontSize, font, color, bold,
    }]);
    setSelectedId(id);
    setError("");
  }

  function handleStagePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (mode === "pan") return;
    if (event.pointerType === "touch" && selectedEdit?.kind === "text" && (mode === "text" || mode === "move")) {
      const startedInEditor = event.target === inlineEditorRef.current;
      if (startedInEditor) return;
      const point = pointFromEvent(event);
      const startedPinch = beginTouchResize(event, selectedEdit);
      if (startedPinch) pendingTouchPlacementRef.current = null;
      else if (mode === "text" && activeTouchPointsRef.current.size === 1) {
        pendingTouchPlacementRef.current = { pointerId: event.pointerId, point };
      }
      event.currentTarget.setPointerCapture(event.pointerId);
      return;
    }
    if (mode === "select") {
      setSelectedId(null);
      setSelectedSourceRun(null);
      setSourceTarget(null);
      return;
    }
    const point = pointFromEvent(event);
    if (mode === "text") {
      addTextAt(point);
      return;
    }
    if (mode === "erase") {
      event.currentTarget.setPointerCapture(event.pointerId);
      setCoverStart(point);
      setCoverEnd(point);
    }
  }

  function handleStagePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (updateResizeGesture(event)) return;
    if (mode === "erase" && coverStart) setCoverEnd(pointFromEvent(event));
  }

  function handleStagePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (finishResizeGesture(event)) return;
    activeTouchPointsRef.current.delete(event.pointerId);
    const pendingPlacement = pendingTouchPlacementRef.current;
    if (pendingPlacement?.pointerId === event.pointerId) {
      pendingTouchPlacementRef.current = null;
      if (!resizeGestureRef.current) addTextAt(pendingPlacement.point);
      return;
    }
    if (!coverStart || !coverEnd) return;
    const x = Math.min(coverStart.x, coverEnd.x);
    const y = Math.min(coverStart.y, coverEnd.y);
    const width = Math.abs(coverEnd.x - coverStart.x);
    const height = Math.abs(coverEnd.y - coverStart.y);
    if (width > 0.008 && height > 0.005) {
      const id = nextIdRef.current++;
      updateEdits((current) => [...current, { id, page, kind: "cover", x, y, width, height }]);
      setSelectedId(id);
    }
    setCoverStart(null);
    setCoverEnd(null);
  }

  function cancelStagePointer() {
    setCoverStart(null);
    setCoverEnd(null);
    pendingTouchPlacementRef.current = null;
  }

  function updateSelectedText(field: "text" | "fontSize" | "font" | "color" | "bold", value: string | number | boolean) {
    if (selectedEdit && (selectedEdit.kind === "text" || selectedEdit.kind === "replace")) {
      updateEdits((current) => current.map((edit) => edit.id === selectedId
        ? { ...edit, [field]: value }
        : edit));
    } else if (selectedSourceRun && sourceTarget) {
      const id = nextIdRef.current++;
      const edit: PdfEdit = {
        id,
        page: selectedSourceRun.page,
        kind: "replace",
        sourceRunId: selectedSourceRun.id,
        sourceObjectIndex: sourceTarget.objectIndex,
        sourceText: sourceTarget.text,
        sourceBounds: sourceTarget.bounds,
        x: selectedSourceRun.x,
        y: selectedSourceRun.y,
        width: selectedSourceRun.width,
        height: selectedSourceRun.height,
        text: selectedSourceRun.text,
        font: sourceTarget.fontFamily,
        fontSize: sourceTarget.fontSize,
        color: sourceTarget.color,
        bold: sourceTarget.bold,
      };
      updateEdits((current) => [...current, { ...edit, [field]: value }]);
      setSelectedId(id);
      setSelectedSourceRun(null);
    }
    if (field === "fontSize") setFontSize(Number(value));
    if (field === "font") setFont(String(value));
    if (field === "color") setColor(String(value));
    if (field === "bold") setBold(Boolean(value));
  }

  function ensureMoveEdit(object: PdfiumPageObject) {
    let edit = edits.find((item) => item.page === page && item.kind === "move" && item.sourceObjectIndex === object.objectIndex);
    if (!edit) {
      edit = {
        id: nextIdRef.current++, page, kind: "move", sourceObjectIndex: object.objectIndex,
        sourceBounds: object.bounds, x: 0, y: 0, moveDx: 0, moveDy: 0, scale: 1,
      };
      updateEdits((current) => [...current, edit!]);
    }
    setSelectedId(edit.id);
    return edit;
  }

  function beginObjectMove(event: React.PointerEvent<HTMLElement>, object: PdfiumPageObject) {
    event.stopPropagation();
    if (mode === "erase") return;
    if (event.pointerType === "touch") {
      if (activeTouchPointsRef.current.size === 0) {
        activeTouchPointsRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      } else {
        const edit = ensureMoveEdit(object);
        if (beginTouchResize(event, edit)) return;
      }
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    const start = pointFromStage(event, pageRef.current!);
    objectDragRef.current = {
      objectIndex: object.objectIndex,
      start,
      offsetX: start.x - object.bounds.left / pageSize.width,
      offsetY: start.y - (1 - object.bounds.top / pageSize.height),
    };
  }

  function updateObjectMove(event: React.PointerEvent<HTMLElement>, object: PdfiumPageObject) {
    if (updateResizeGesture(event)) return;
    const drag = objectDragRef.current;
    if (!drag || !pageRef.current) return;
    const point = pointFromStage(event, pageRef.current);
    setDragPreview({ id: -(object.objectIndex + 1), x: point.x - drag.offsetX, y: point.y - drag.offsetY });
  }

  function finishObjectMove(event: React.PointerEvent<HTMLElement>, object: PdfiumPageObject) {
    if (finishResizeGesture(event)) {
      objectDragRef.current = null;
      return;
    }
    activeTouchPointsRef.current.delete(event.pointerId);
    const drag = objectDragRef.current;
    objectDragRef.current = null;
    if (!drag || !pageRef.current) return;
    const point = pointFromStage(event, pageRef.current);
    const dx = point.x - drag.start.x;
    const dy = point.y - drag.start.y;
    setDragPreview(null);
    if (Math.abs(dx) < .002 && Math.abs(dy) < .002) return;
    const existing = edits.find((edit) => edit.page === page && edit.kind === "move" && edit.sourceObjectIndex === object.objectIndex);
    if (existing) {
      setSelectedId(existing.id);
      updateEdits((current) => current.map((edit) => edit.id === existing.id
        ? { ...edit, moveDx: (edit.moveDx ?? 0) + dx, moveDy: (edit.moveDy ?? 0) + dy }
        : edit));
    } else {
      const id = nextIdRef.current++;
      setSelectedId(id);
      updateEdits((current) => [...current, { id, page, kind: "move", sourceObjectIndex: object.objectIndex, sourceBounds: object.bounds, x: 0, y: 0, moveDx: dx, moveDy: dy, scale: 1 }]);
    }
  }

  function cancelObjectMove() {
    objectDragRef.current = null;
    resizeGestureRef.current = null;
    activeTouchPointsRef.current.clear();
    setResizePreview(null);
    setDragPreview(null);
  }

  function eraseObject(object: PdfiumPageObject) {
    const id = nextIdRef.current++;
    updateEdits((current) => [...current, {
      id, page, kind: "erase", sourceObjectIndex: object.objectIndex,
      x: object.bounds.left, y: object.bounds.top,
      width: object.bounds.right - object.bounds.left, height: object.bounds.top - object.bounds.bottom,
    }]);
    setSelectedId(id);
  }

  function removeSelected() {
    updateEdits((current) => current.filter((edit) => edit.id !== selectedId));
    setSelectedId(null);
  }

  function moveSelected(dx: number, dy: number) {
    updateEdits((current) => current.map((edit) => edit.id === selectedId
      ? edit.kind === "move"
        ? { ...edit, moveDx: (edit.moveDx ?? 0) + dx, moveDy: (edit.moveDy ?? 0) + dy }
        : { ...edit, x: Math.min(1, Math.max(0, edit.x + dx)), y: Math.min(1, Math.max(0, edit.y + dy)) }
      : edit));
  }

  function resizeSelectedBy(direction: -1 | 1) {
    if (!selectedEdit && selectedSourceRun && sourceTarget) {
      const replacement = ensureReplacementEdit();
      if (!replacement) return;
    }
    updateEdits((current) => current.map((edit) => {
      if (edit.id !== selectedId && !(edit.kind === "replace" && selectedSourceRun && edit.sourceRunId === selectedSourceRun.id)) return edit;
      if (edit.kind === "text") return { ...edit, fontSize: Math.min(72, Math.max(8, (edit.fontSize ?? 16) + direction * 2)) };
      if (edit.kind === "replace" || edit.kind === "move") return { ...edit, scale: Math.min(5, Math.max(.2, (edit.scale ?? 1) * (direction > 0 ? 1.1 : .9))) };
      return edit;
    }));
  }

  function beginTouchResize(event: React.PointerEvent, edit: PdfEdit) {
    if (event.pointerType !== "touch") return false;
    const points = activeTouchPointsRef.current;
    if (points.has(event.pointerId)) {
      const gesture = resizeGestureRef.current;
      if (gesture?.editId === edit.id) {
        event.preventDefault();
        event.stopPropagation();
        return true;
      }
      return false;
    }
    points.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (points.size < 2) return false;
    const [first, second] = Array.from(points.values());
    const distance = Math.max(1, Math.hypot(second.x - first.x, second.y - first.y));
    event.preventDefault();
    event.stopPropagation();
    if (event.currentTarget instanceof HTMLTextAreaElement) event.currentTarget.blur();
    dragRef.current = null;
    inlineDragRef.current = null;
    objectDragRef.current = null;
    setDragPreview(null);
    resizeGestureRef.current = {
      editId: edit.id,
      pointerId: event.pointerId,
      startDistance: distance,
      startFontSize: edit.fontSize ?? 16,
      startScale: edit.scale ?? 1,
      anchorX: (first.x + second.x) / 2,
      anchorY: (first.y + second.y) / 2,
    };
    pendingTouchPlacementRef.current = null;
    setSelectedId(edit.id);
    setResizePreview({ editId: edit.id, fontSize: edit.fontSize ?? 16, scale: edit.scale ?? 1 });
    event.currentTarget.setPointerCapture(event.pointerId);
    return true;
  }

  function beginCornerResize(event: React.PointerEvent<HTMLButtonElement>, edit: PdfEdit, corner: "top-left" | "top-right" | "bottom-left" | "bottom-right") {
    event.preventDefault();
    event.stopPropagation();
    const resizeEdit = edit.id < 0 ? ensureReplacementEdit() ?? edit : edit;
    const bounds = event.currentTarget.parentElement?.getBoundingClientRect();
    if (!bounds) return;
    const anchorX = corner.endsWith("left") ? bounds.right : bounds.left;
    const anchorY = corner.startsWith("top") ? bounds.bottom : bounds.top;
    const distance = Math.max(1, Math.hypot(event.clientX - anchorX, event.clientY - anchorY));
    resizeGestureRef.current = {
      editId: resizeEdit.id,
      pointerId: event.pointerId,
      startDistance: distance,
      startFontSize: resizeEdit.fontSize ?? 16,
      startScale: resizeEdit.scale ?? 1,
      anchorX,
      anchorY,
    };
    setSelectedId(resizeEdit.id);
    setResizePreview({ editId: resizeEdit.id, fontSize: resizeEdit.fontSize ?? 16, scale: resizeEdit.scale ?? 1 });
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function updateResizeGesture(event: React.PointerEvent) {
    const gesture = resizeGestureRef.current;
    if (!gesture) return false;
    let distance: number;
    if (event.pointerType === "touch" && activeTouchPointsRef.current.size >= 2) {
      activeTouchPointsRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      const [first, second] = Array.from(activeTouchPointsRef.current.values());
      distance = Math.max(1, Math.hypot(second.x - first.x, second.y - first.y));
    } else if (event.pointerType === "touch" && activeTouchPointsRef.current.size > 0) {
      // Keep the final two-finger size until both contacts are released.
      return true;
    } else {
      if (gesture.pointerId !== event.pointerId) return false;
      distance = Math.max(1, Math.hypot(event.clientX - gesture.anchorX, event.clientY - gesture.anchorY));
    }
    event.preventDefault();
    const ratio = Math.min(5, Math.max(.2, distance / gesture.startDistance));
    setResizePreview({ editId: gesture.editId, fontSize: Math.min(72, Math.max(8, gesture.startFontSize * ratio)), scale: Math.min(5, Math.max(.2, gesture.startScale * ratio)) });
    return true;
  }

  function finishResizeGesture(event: React.PointerEvent) {
    const gesture = resizeGestureRef.current;
    if (!gesture) return false;
    if (event.pointerType === "touch" && activeTouchPointsRef.current.has(event.pointerId)) {
      activeTouchPointsRef.current.delete(event.pointerId);
      if (activeTouchPointsRef.current.size > 0) return true;
    } else if (gesture.pointerId !== event.pointerId) {
      return false;
    }
    const preview = resizePreview;
    if (preview?.editId === gesture.editId) {
      updateEdits((current) => current.map((edit) => edit.id === gesture.editId
        ? edit.kind === "text"
          ? { ...edit, fontSize: preview.fontSize }
          : { ...edit, scale: preview.scale }
        : edit));
    }
    resizeGestureRef.current = null;
    setResizePreview(null);
    return true;
  }

  async function selectExistingText(run: PdfTextRun) {
    const existing = edits.find((edit) => edit.sourceRunId === run.id);
    if (existing) {
      setSelectedId(existing.id);
      setSelectedSourceRun(null);
      setSourceTarget(null);
      return;
    }
    setSelectedId(null);
    setSelectedSourceRun(run);
    setSourceTarget(null);
    setMode("select");
    setError("Reading the original PDF text style...");
    try {
      if (!fileBytes) throw new Error("Reload the PDF before selecting text.");
      const target = await locatePdfiumText(
        fileBytes,
        run.page - 1,
        run.x,
        run.y,
        run.width,
        run.height,
        run.text,
      );
      setSourceTarget(target);
      setFontSize(target.fontSize);
      setFont(target.fontFamily);
      setColor(target.color);
      setBold(target.bold);
      setError("");
    } catch (cause) {
      setSelectedSourceRun(null);
      setError(cause instanceof Error ? cause.message : "This PDF text cannot be safely edited.");
    }
  }

  function ensureReplacementEdit() {
    if (selectedEdit?.kind === "replace") return selectedEdit;
    if (!selectedSourceRun || !sourceTarget) return null;
    const edit: PdfEdit = {
      id: nextIdRef.current++, page: selectedSourceRun.page, kind: "replace",
      sourceRunId: selectedSourceRun.id, sourceObjectIndex: sourceTarget.objectIndex,
      sourceText: sourceTarget.text, sourceBounds: sourceTarget.bounds,
      x: selectedSourceRun.x, y: selectedSourceRun.y,
      width: selectedSourceRun.width, height: selectedSourceRun.height,
      text: selectedSourceRun.text, font: sourceTarget.fontFamily,
      fontSize: sourceTarget.fontSize, color: sourceTarget.color,
      bold: sourceTarget.bold, scale: 1,
    };
    updateEdits((current) => [...current, edit]);
    setSelectedId(edit.id);
    setSelectedSourceRun(null);
    return edit;
  }

  function beginReplacementTouch(event: React.PointerEvent<HTMLTextAreaElement>) {
    event.stopPropagation();
    if (event.pointerType !== "touch") return;
    if (activeTouchPointsRef.current.size === 0) {
      activeTouchPointsRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      return;
    }
    const edit = ensureReplacementEdit();
    if (edit) beginTouchResize(event, edit);
  }

  function finishReplacementTouch(event: React.PointerEvent<HTMLTextAreaElement>) {
    if (finishResizeGesture(event)) return;
    activeTouchPointsRef.current.delete(event.pointerId);
  }

  function beginTextDrag(event: React.PointerEvent<HTMLDivElement>, edit: PdfEdit) {
    if ((mode !== "select" && mode !== "text" && mode !== "move") || !stageRef.current) return;
    if (beginTouchResize(event, edit)) return;
    event.preventDefault();
    event.stopPropagation();
    if (!pageRef.current) return;
    const point = pointFromStage(event, pageRef.current);
    dragRef.current = { id: edit.id, offsetX: point.x - edit.x, offsetY: point.y - edit.y };
    setDragPreview({ id: edit.id, x: edit.x, y: edit.y });
    setSelectedId(edit.id);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveTextDrag(event: React.PointerEvent<HTMLElement>, edit: PdfEdit) {
    if (updateResizeGesture(event)) return;
    if (!dragRef.current || dragRef.current.id !== edit.id || !pageRef.current) return;
    event.preventDefault();
    const point = pointFromStage(event, pageRef.current);
    setDragPreview({
      id: edit.id,
      x: Math.min(1, Math.max(0, point.x - dragRef.current.offsetX)),
      y: Math.min(1, Math.max(0, point.y - dragRef.current.offsetY)),
    });
  }

  function beginInlineTextGesture(event: React.PointerEvent<HTMLTextAreaElement>, edit: PdfEdit) {
    if (beginTouchResize(event, edit)) return;
    event.stopPropagation();
    if (!pageRef.current) return;
    const point = pointFromStage(event, pageRef.current);
    inlineDragRef.current = {
      id: edit.id,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: point.x - edit.x,
      offsetY: point.y - edit.y,
      dragging: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveInlineTextGesture(event: React.PointerEvent<HTMLTextAreaElement>, edit: PdfEdit) {
    if (updateResizeGesture(event)) return;
    const gesture = inlineDragRef.current;
    if (!gesture || gesture.id !== edit.id || !pageRef.current) return;
    if (!gesture.dragging) {
      const distance = Math.hypot(event.clientX - gesture.startX, event.clientY - gesture.startY);
      if (distance < 8) return;
      gesture.dragging = true;
      dragRef.current = { id: edit.id, offsetX: gesture.offsetX, offsetY: gesture.offsetY };
      setSelectedId(edit.id);
    }
    event.preventDefault();
    moveTextDrag(event, edit);
  }

  function finishInlineTextGesture(event: React.PointerEvent<HTMLTextAreaElement>, edit: PdfEdit) {
    if (finishResizeGesture(event)) return;
    activeTouchPointsRef.current.delete(event.pointerId);
    const gesture = inlineDragRef.current;
    if (!gesture || gesture.id !== edit.id) return;
    inlineDragRef.current = null;
    if (gesture.dragging) endTextDrag(event, edit);
  }

  function endTextDrag(event: React.PointerEvent, edit: PdfEdit) {
    if (finishResizeGesture(event)) return;
    activeTouchPointsRef.current.delete(event.pointerId);
    if (!dragRef.current || dragRef.current.id !== edit.id || !dragPreview) return;
    const position = dragPreview;
    updateEdits((current) => current.map((item) => item.id === edit.id
      ? { ...item, x: position.x, y: position.y }
      : item));
    dragRef.current = null;
    setDragPreview(null);
  }

  async function exportPdf() {
    const readyEdits = edits.filter((edit) => edit.kind !== "text" || Boolean(edit.text?.trim()));
    if (!fileBytes || readyEdits.length === 0) return;
    setBusy(true);
    setError("");
    try {
      const replacementEdits = readyEdits.filter((edit) => edit.kind === "replace" && edit.text !== edit.sourceText);
      let pdfiumBytes = replacementEdits.length
        ? await applyPdfiumTextChanges(fileBytes, replacementEdits.map((edit) => ({
          page: edit.page,
          objectIndex: edit.sourceObjectIndex!,
          originalText: edit.sourceText!,
          text: edit.text ?? "",
          originalBounds: edit.sourceBounds!,
        })))
        : fileBytes;
      if (replacementEdits.length) {
        const textPreview = await openPdfDocument(pdfiumBytes);
        try { await verifyReplacementText(textPreview, replacementEdits); }
        finally { await textPreview.cleanup(); }
      }
      const objectEdits = readyEdits.filter((edit) => edit.kind === "move" || edit.kind === "erase" || (edit.kind === "replace" && (edit.scale ?? 1) !== 1));
      const objectChanges = await Promise.all(objectEdits.map(async (edit) => {
        const sourcePage = await document!.getPage(edit.page);
        const viewport = sourcePage.getViewport({ scale: 1 });
        const bounds = edit.sourceBounds;
        return {
          page: edit.page,
          objectIndex: edit.sourceObjectIndex!,
          dx: (edit.moveDx ?? 0) * viewport.width,
          dy: -(edit.moveDy ?? 0) * viewport.height,
          scale: edit.scale ?? 1,
          originX: bounds ? (bounds.left + bounds.right) / 2 : 0,
          originY: bounds ? (bounds.bottom + bounds.top) / 2 : 0,
          erase: edit.kind === "erase",
        };
      }));
      pdfiumBytes = await applyPdfiumObjectChanges(pdfiumBytes, objectChanges);
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
      const pdf = await PDFDocument.load(pdfiumBytes);
      const embeddedFonts = new Map<string, Awaited<ReturnType<typeof pdf.embedFont>>>();
      const pages = pdf.getPages();
      for (const edit of readyEdits) {
        const target = pages[edit.page - 1];
        if (!target) continue;
        const { width, height } = target.getSize();
        if (edit.kind === "cover") {
          target.drawRectangle({
            x: edit.x * width,
            y: height * (1 - edit.y - (edit.height ?? 0)),
            width: (edit.width ?? 0) * width,
            height: (edit.height ?? 0) * height,
            color: rgb(1, 1, 1),
          });
        } else if (edit.kind === "text") {
          const requestedFont = edit.font ?? "Helvetica";
          const family = /times|georgia|serif/i.test(requestedFont) ? "Times Roman"
            : /courier|mono|consolas/i.test(requestedFont) ? "Courier"
              : "Helvetica";
          const fontKey = `${family}${edit.bold ? " Bold" : ""}`;
          if (!embeddedFonts.has(fontKey)) {
            const standardFont = family === "Times Roman"
              ? (edit.bold ? StandardFonts.TimesRomanBold : StandardFonts.TimesRoman)
              : family === "Courier"
                ? (edit.bold ? StandardFonts.CourierBold : StandardFonts.Courier)
                : (edit.bold ? StandardFonts.HelveticaBold : StandardFonts.Helvetica);
            embeddedFonts.set(fontKey, await pdf.embedFont(standardFont));
          }
          const hex = (edit.color ?? "#111111").replace("#", "");
          const red = Number.parseInt(hex.slice(0, 2), 16) / 255;
          const green = Number.parseInt(hex.slice(2, 4), 16) / 255;
          const blue = Number.parseInt(hex.slice(4, 6), 16) / 255;
          const size = edit.fontSize ?? 16;
          target.drawText(edit.text ?? "", {
            x: edit.x * width,
            y: height * (1 - edit.y) - size,
            size,
            font: embeddedFonts.get(fontKey),
            color: rgb(red, green, blue),
            lineHeight: size * 1.2,
            maxWidth: width * (1 - edit.x),
          });
        }
      }
      const result = await pdf.save();
      const exportedPdfCheck = await openPdfDocument(result);
      await exportedPdfCheck.cleanup();
      const url = URL.createObjectURL(new Blob([result as BlobPart], { type: "application/pdf" }));
      const link = window.document.createElement("a");
      link.href = url;
      link.download = `${normalizeDownloadName(fileName)}.pdf`;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldnâ€™t export this PDF. Try a different file or a smaller set of edits.");
    } finally {
      setBusy(false);
    }
  }

  const visibleEdits = edits.filter((edit) => edit.page === page);
  const readyEditCount = edits.filter((edit) => edit.kind !== "text" || Boolean(edit.text?.trim())).length;
  const visibleTextRuns = textRuns.filter((run) => run.page === page);
  const detectedFonts = Array.from(new Set(textRuns.map((run) => run.fontFamily)))
    .filter((name) => name && name !== "Unknown PDF font");
  const dragCover = coverStart && coverEnd ? {
    x: Math.min(coverStart.x, coverEnd.x),
    y: Math.min(coverStart.y, coverEnd.y),
    width: Math.abs(coverStart.x - coverEnd.x),
    height: Math.abs(coverStart.y - coverEnd.y),
  } : null;
  const replacementScale = resizePreview?.editId === selectedEdit?.id ? resizePreview?.scale ?? (selectedEdit?.scale ?? 1) : selectedEdit?.scale ?? 1;
  const replacementResizeEdit = selectedEdit?.kind === "replace" ? selectedEdit : selectedSourceRun && sourceTarget ? {
    id: -1,
    page: selectedSourceRun.page,
    kind: "replace" as const,
    sourceRunId: selectedSourceRun.id,
    sourceObjectIndex: sourceTarget.objectIndex,
    sourceText: sourceTarget.text,
    sourceBounds: sourceTarget.bounds,
    x: selectedSourceRun.x,
    y: selectedSourceRun.y,
    width: selectedSourceRun.width,
    height: selectedSourceRun.height,
    text: selectedSourceRun.text,
    font: sourceTarget.fontFamily,
    fontSize: sourceTarget.fontSize,
    color: sourceTarget.color,
    bold: sourceTarget.bold,
    scale: 1,
  } satisfies PdfEdit : null;
  const replacementEditorFontSize = inlineReplacementRun
    ? Math.max(8, (sourceTarget?.fontSize ?? inlineReplacementRun.fontSize) * pageScale * replacementScale)
    : 16;
  const replacementEditorScale = Math.min(1, replacementEditorFontSize / 16);

  function changePreviewZoom(delta: number) {
    setPreviewZoom((current) => Math.min(MAX_PREVIEW_ZOOM, Math.max(MIN_PREVIEW_ZOOM, Math.round((current + delta) * 100) / 100)));
  }

  function renderResizeHandles(edit: PdfEdit, frameStyle: React.CSSProperties) {
    return <div className={styles.resizeHandles} style={frameStyle} aria-label="Resize selected PDF element">
      {RESIZE_CORNERS.map((corner) => <button
        key={corner}
        type="button"
        className={`${styles.resizeHandle} ${styles[corner]}`}
        aria-label={`Resize from ${corner.replace("-", " ")}`}
        // This handler uses refs only after the user presses a resize handle.
        // eslint-disable-next-line react-hooks/refs
        onPointerDown={(event) => beginCornerResize(event, edit, corner)}
        onPointerMove={updateResizeGesture}
        onPointerUp={finishResizeGesture}
        onPointerCancel={finishResizeGesture}
      />)}
    </div>;
  }

  return (
    <>
      <CustomCursor />
      <main className={styles.page}>
        <div className={styles.toolbar}>
          <Link href="/#tools" className={styles.backLink}>&#8592; TRUDEV &middot; TOOLS</Link>
          <span className={styles.privacyTag}><span /> PRIVATE BY DESIGN</span>
        </div>
        <header className={styles.heading}>
          <p className={styles.eyebrow}>FREE &middot; PRIVATE &middot; PROTOTYPE</p>
          <h1>PDF<br />EDITOR.</h1>
          <p>Edit supported PDF text in place, move or erase detected page objects, and add text. Your file stays on this device.</p>
        </header>

        {!document ? (
          <section className={styles.uploadPanel} aria-label="Upload a PDF">
            <span className={styles.uploadIndex}>01 / START HERE</span>
            <div className={styles.uploadMark} aria-hidden="true">PDF<span>+</span></div>
            <h2>Bring your document.</h2>
            <p>Choose a PDF up to 25 MB. It stays in this browser and is never uploaded.</p>
            <button className={styles.primaryButton} type="button" onClick={() => inputRef.current?.click()} disabled={busy}>
              {busy ? "Opening PDF..." : "Choose a PDF"}<span aria-hidden="true">&#8599;</span>
            </button>
            <input ref={inputRef} className={styles.fileInput} type="file" accept="application/pdf,.pdf" onChange={(event) => { void loadFile(event.target.files?.[0]); event.currentTarget.value = ""; }} />
            <span className={styles.fileHint}>PDF ONLY &middot; MAX 25 MB</span>
            {error && <p className={styles.error} role="alert">{error}</p>}
          </section>
        ) : (
          <section className={styles.editorShell} aria-label="PDF editor">
            <div className={styles.documentBar}>
              <div className={styles.fileInfo}>
                <span className={styles.fileIcon}>PDF</span>
                <div className={styles.fileMeta}>
                  {renamingFile ? <div className={styles.fileNameEditor}>
                    <input ref={fileNameInputRef} value={draftFileName} onChange={(event) => setDraftFileName(event.target.value)} aria-label="New PDF file name" onKeyDown={(event) => {
                      if (event.key === "Enter") { event.preventDefault(); commitRenameFile(); }
                      if (event.key === "Escape") setRenamingFile(false);
                    }} />
                    <span>.pdf</span>
                    <button type="button" aria-label="Save PDF file name" title="Save name" onClick={commitRenameFile}>&#10003;</button>
                  </div> : <div className={styles.fileNameRow}>
                    <strong title={fileName}>{fileName}</strong>
                    <button type="button" className={styles.renameFile} onClick={beginRenameFile} aria-label={`Rename ${fileName}`} title="Rename PDF">&#9998;</button>
                  </div>}
                  <span>{pageCount} {pageCount === 1 ? "page" : "pages"} &middot; on this device</span>
                </div>
              </div>
              <button className={styles.changeFile} type="button" onClick={() => inputRef.current?.click()}>Change file</button>
              <input ref={inputRef} className={styles.fileInput} type="file" accept="application/pdf,.pdf" onChange={(event) => { void loadFile(event.target.files?.[0]); event.currentTarget.value = ""; }} />
            </div>
            <div className={styles.editorGrid}>
              <div className={styles.documentColumn}>
                <div className={styles.mobileToolbar} aria-label="Quick PDF editing tools">
                  <div className={styles.mobileToolRow}>
                    <button type="button" className={mode === "select" ? styles.mobileToolActive : ""} onClick={() => setMode("select")} aria-label="Select PDF text">A</button>
                    <button type="button" className={mode === "move" ? styles.mobileToolActive : ""} onClick={() => { setMode("move"); setSelectedId(null); setSelectedSourceRun(null); setSourceTarget(null); }} aria-label="Move PDF elements">+</button>
                    <button type="button" className={mode === "pan" ? styles.mobileToolActive : ""} onClick={() => setMode("pan")} aria-label="Scroll PDF page" title="Scroll page">&#8597;</button>
                    <button type="button" className={mode === "text" ? styles.mobileToolActive : ""} onClick={() => { setMode("text"); setSelectedId(null); setSelectedSourceRun(null); setSourceTarget(null); setFont("Helvetica"); setBold(false); }} aria-label="Add text">T</button>
                    <button type="button" className={mode === "erase" ? styles.mobileToolActive : ""} onClick={() => { setMode("erase"); setSelectedId(null); setSelectedSourceRun(null); setSourceTarget(null); }} aria-label="Erase">&#215;</button>
                    <button type="button" disabled={!history.past.length} onClick={undo} aria-label="Undo last edit">↶</button>
                    <button type="button" disabled={!history.future.length} onClick={redo} aria-label="Redo last edit">↷</button>

                  </div>
                  {selectedId !== null && <button type="button" className={styles.mobileRemoveAction} onClick={removeSelected}>Remove selected edit <span aria-hidden="true">&#215;</span></button>}
                  {(mode === "text" || selectedEdit?.kind === "text") && <div className={styles.mobileTextStyle}>
                    <label>Font<select value={activeFont} onChange={(event) => updateSelectedText("font", event.target.value)}>{detectedFonts.map((name) => <option key={name} value={name}>Detected: {name}</option>)}<option>Arial</option><option>Calibri</option><option>Georgia</option><option>Times New Roman</option><option>Verdana</option><option>Helvetica</option><option>Courier New</option></select></label>
                    <label>Size<input type="number" min="8" max="72" value={activeFontSize} onChange={(event) => updateSelectedText("fontSize", Math.min(72, Math.max(8, Number(event.target.value) || 8)))} /></label>
                    <label>Color<input type="color" aria-label="Text color" value={activeColor} onChange={(event) => updateSelectedText("color", event.target.value)} /></label>
                  </div>}
                  {(selectedEdit?.kind === "text" || selectedEdit?.kind === "move" || selectedEdit?.kind === "replace" || editingExistingText) && <div className={styles.mobileSizeActions} aria-label="Resize selected element">
                    <span>SIZE</span>
                    <button type="button" aria-label="Decrease selected element size" onClick={() => resizeSelectedBy(-1)}>&minus;</button>
                    <button type="button" aria-label="Increase selected element size" onClick={() => resizeSelectedBy(1)}>+</button>
                  </div>}
                  <p className={styles.mobileToolHint}>{editingExistingText ? "Tap the highlighted text to edit it. Pinch to resize, or use the size controls; original styling is retained." : mode === "pan" ? "Swipe over the page to scroll without editing." : mode === "text" ? "Tap a blank area to add text. Drag to move it; pinch to resize. Tap Add text again to place another." : mode === "move" ? "Drag detected PDF objects or added text. Pinch the selected element to resize it." : mode === "erase" ? "Tap a detected object to remove it. Drag blank space for a visual cover." : "Tap text on the page to edit it. Drag added text to move it; pinch to resize."}</p>
                </div>
                <div className={styles.pageControls}>
                  <div className={styles.pageStepper}>
                    <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>&#8592;</button>
                    <span><strong>{String(page).padStart(2, "0")}</strong><span> / {String(pageCount).padStart(2, "0")}</span></span>
                    <button type="button" aria-label="Next page" disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)}>&#8594;</button>
                  </div>
                  <span className={styles.modeHint}>{previewBusy ? "UPDATING PDF PREVIEWâ€¦" : previewDocument && edits.some((edit) => edit.kind === "replace" || edit.kind === "move" || edit.kind === "erase") ? "PREVIEW UPDATED Â· ORIGINAL PDF TEXT STYLE" : mode === "text" ? "TAP PAGE TO PLACE TEXT" : mode === "erase" ? "TAP AN OBJECT TO ERASE IT" : mode === "move" ? "DRAG AN OBJECT TO MOVE IT" : "TAP TEXT TO SELECT ITS ORIGINAL PDF STYLE"}</span>
                </div>
                <div className={styles.previewZoomControls} aria-label="PDF preview zoom controls">
                  <span>PREVIEW ZOOM</span>
                  <button type="button" aria-label="Zoom out preview" disabled={previewZoom <= MIN_PREVIEW_ZOOM} onClick={() => changePreviewZoom(-0.25)}>&minus;</button>
                  <output aria-live="polite">{Math.round(previewZoom * 100)}%</output>
                  <button type="button" aria-label="Zoom in preview" disabled={previewZoom >= MAX_PREVIEW_ZOOM} onClick={() => changePreviewZoom(0.25)}>+</button>
                  <button type="button" onClick={() => setPreviewZoom(1)} disabled={previewZoom === 1}>Fit</button>
                </div>
                <div className={styles.stageWrap} ref={stageRef}>
                  <div
                    ref={pageRef}
                    className={`${styles.pageStage} ${mode === "text" ? styles.textMode : ""} ${mode === "erase" ? styles.coverMode : ""} ${mode === "move" ? styles.moveMode : ""} ${mode === "pan" ? styles.panMode : ""}`}
                    style={{ width: canvasWidth || undefined, minHeight: canvasHeight || 600 }}
                    onPointerDown={handleStagePointerDown}
                    onPointerMove={handleStagePointerMove}
                    onPointerUp={handleStagePointerUp}
                    onPointerCancel={cancelStagePointer}
                  >
                    <canvas ref={canvasRef} className={styles.pdfCanvas} aria-label={`PDF page ${page}`} />
                    <div className={styles.editLayer}>
                      {(mode === "move" || mode === "erase") && pageObjects.map((object) => {
                        const matchingObjectEdits = edits.filter((edit) => edit.page === page && edit.sourceObjectIndex === object.objectIndex && (edit.kind === "move" || edit.kind === "erase"));
                        const objectEdit = matchingObjectEdits.find((edit) => edit.kind === "erase") ?? matchingObjectEdits.find((edit) => edit.kind === "move");
                        if (objectEdit?.kind === "erase") return null;
                        const baseX = object.bounds.left / pageSize.width;
                        const baseY = 1 - object.bounds.top / pageSize.height;
                        const objectWidth = (object.bounds.right - object.bounds.left) / pageSize.width;
                        const objectHeight = (object.bounds.top - object.bounds.bottom) / pageSize.height;
                        const dx = objectEdit?.kind === "move" ? objectEdit.moveDx ?? 0 : 0;
                        const dy = objectEdit?.kind === "move" ? objectEdit.moveDy ?? 0 : 0;
                        const scale = resizePreview?.editId === objectEdit?.id ? resizePreview?.scale ?? (objectEdit?.scale ?? 1) : objectEdit?.scale ?? 1;
                        const isDragging = dragPreview?.id === -(object.objectIndex + 1);
                        const x = (isDragging ? dragPreview.x : baseX + dx) - (objectWidth * (scale - 1)) / 2;
                        const y = (isDragging ? dragPreview.y : baseY + dy) - (objectHeight * (scale - 1)) / 2;
                        const frameStyle = { left: `${x * 100}%`, top: `${y * 100}%`, width: `${Math.max(.35, objectWidth * scale * 100)}%`, height: `${Math.max(.35, objectHeight * scale * 100)}%` };
                        return <Fragment key={`pdf-object-${object.objectIndex}`}><button type="button"
                          className={`${styles.objectTarget} ${objectEdit?.kind === "move" ? styles.objectMoved : ""}`}
                          style={{ ...frameStyle, zIndex: 5 + object.objectIndex }}
                          aria-label={`${mode === "erase" ? "Erase" : "Move"} PDF ${object.type === 1 ? "text" : object.type === 2 ? "shape" : object.type === 3 ? "image" : "object"}`}
                          title={mode === "erase" ? "Tap to erase this PDF object" : "Drag to move this PDF object"}
                          onPointerDown={(event) => beginObjectMove(event, object)}
                          onPointerMove={(event) => updateObjectMove(event, object)}
                          onPointerUp={(event) => finishObjectMove(event, object)}
                          onPointerCancel={cancelObjectMove}
                          onClick={(event) => { event.stopPropagation(); if (mode === "erase") eraseObject(object); else ensureMoveEdit(object); }} />
                          {mode === "move" && selectedId === objectEdit?.id && objectEdit && renderResizeHandles(objectEdit, frameStyle)}
                        </Fragment>;
                      })}
                      {mode === "select" && visibleTextRuns.map((run) => (
                        <button
                          key={run.id}
                          type="button"
                          className={`${styles.sourceText} ${selectedSourceRun?.id === run.id || selectedEdit?.sourceRunId === run.id ? styles.sourceTextSelected : ""}`}
                          style={{ left: `${run.x * 100}%`, top: `${run.y * 100}%`, width: `${run.width * 100}%`, height: `${run.height * 100}%` }}
                          aria-label={`Select existing PDF text: ${run.text}. Detected font: ${run.fontFamily}`}
                          title={`Replace â€œ${run.text}â€ Â· detected font: ${run.fontFamily}`}
                          onPointerDown={(event) => event.stopPropagation()}
                          onClick={() => { void selectExistingText(run); }}
                        >{run.text}</button>
                      ))}
                      {inlineReplacementRun && (sourceTarget || selectedEdit?.kind === "replace") && <textarea
                        ref={inlineEditorRef}
                        className={`${styles.inlineTextEditor} ${styles.inlineReplacementEditor}`}
                        aria-label="Edit selected PDF text"
                        value={activeText}
                        onChange={(event) => updateSelectedText("text", event.target.value)}
                        onPointerDown={beginReplacementTouch}
                        onPointerMove={updateResizeGesture}
                        onPointerUp={finishReplacementTouch}
                        onPointerCancel={finishReplacementTouch}
                        onKeyDown={(event) => { if (event.key === "Escape") event.currentTarget.blur(); }}
                        style={{ left: `${(inlineReplacementRun.x - inlineReplacementRun.width * (replacementScale - 1) / 2) * 100}%`, top: `${(inlineReplacementRun.y - inlineReplacementRun.height * (replacementScale - 1) / 2) * 100}%`, width: `${inlineReplacementRun.width * replacementScale * 100 / replacementEditorScale}%`, height: `${inlineReplacementRun.height * replacementScale * 100 / replacementEditorScale}%`, transform: `scale(${replacementEditorScale})`, transformOrigin: "top left", fontFamily: sourceTarget?.fontFamily ?? inlineReplacementRun.fontFamily, fontSize: `${Math.max(16, replacementEditorFontSize)}px`, fontWeight: (sourceTarget?.bold ?? inlineReplacementRun.bold) ? 700 : 400, color: sourceTarget?.color ?? selectedEdit?.color ?? color }}
                      />}
                      {inlineReplacementRun && replacementResizeEdit && renderResizeHandles(replacementResizeEdit, {
                        left: `${(inlineReplacementRun.x - inlineReplacementRun.width * (replacementScale - 1) / 2) * 100}%`,
                        top: `${(inlineReplacementRun.y - inlineReplacementRun.height * (replacementScale - 1) / 2) * 100}%`,
                        width: `${inlineReplacementRun.width * replacementScale * 100}%`,
                        height: `${inlineReplacementRun.height * replacementScale * 100}%`,
                      })}
                      {visibleEdits.map((edit) => {
                        const resizeFontSize = resizePreview?.editId === edit.id ? resizePreview.fontSize : edit.fontSize ?? 16;
                        const editorFontSize = Math.max(8, resizeFontSize * pageScale);
                        const editorScale = Math.min(1, editorFontSize / 16);
                        const textBoxWidth = Math.max(18, Math.min(38, (1 - edit.x) * 100));
                        const textBoxHeight = Math.max(28, resizeFontSize * pageScale * 1.7);
                        return edit.kind === "text" ? (
                          <Fragment key={edit.id}>
                            {selectedId === edit.id && mode !== "move" ? <textarea
                              ref={inlineEditorRef}
                              className={`${styles.inlineTextEditor} ${styles.inlineAddedTextEditor}`}
                              aria-label="Edit added text"
                              value={edit.text ?? ""}
                              onChange={(event) => updateSelectedText("text", event.target.value)}
                              onPointerDown={(event) => beginInlineTextGesture(event, edit)}
                              onPointerMove={(event) => moveInlineTextGesture(event, edit)}
                              onPointerUp={(event) => finishInlineTextGesture(event, edit)}
                              onPointerCancel={(event) => finishInlineTextGesture(event, edit)}
                              onLostPointerCapture={(event) => finishInlineTextGesture(event, edit)}
                              onKeyDown={(event) => { if (event.key === "Escape") event.currentTarget.blur(); }}
                              style={{ left: `${(dragPreview?.id === edit.id ? dragPreview.x : edit.x) * 100}%`, top: `${(dragPreview?.id === edit.id ? dragPreview.y : edit.y) * 100}%`, width: `${textBoxWidth / editorScale}%`, minHeight: `${textBoxHeight / editorScale}px`, transform: `scale(${editorScale})`, transformOrigin: "top left", color: edit.color, fontSize: `${Math.max(16, editorFontSize)}px`, fontFamily: /times|georgia|serif/i.test(edit.font ?? "") ? "Georgia, serif" : /courier|mono|consolas/i.test(edit.font ?? "") ? "monospace" : "Arial, sans-serif", fontWeight: edit.bold ? 700 : 400 }}
                            /> : <div
                              className={styles.textEdit}
                              style={{ left: `${(dragPreview?.id === edit.id ? dragPreview.x : edit.x) * 100}%`, top: `${(dragPreview?.id === edit.id ? dragPreview.y : edit.y) * 100}%`, color: edit.color, fontSize: `${editorFontSize}px`, fontFamily: /times|georgia|serif/i.test(edit.font ?? "") ? "Georgia, serif" : /courier|mono|consolas/i.test(edit.font ?? "") ? "monospace" : "Arial, sans-serif", fontWeight: edit.bold ? 700 : 400 }}
                              onPointerDown={(event) => beginTextDrag(event, edit)}
                              onPointerMove={(event) => moveTextDrag(event, edit)}
                              onPointerUp={(event) => endTextDrag(event, edit)}
                              onPointerCancel={(event) => endTextDrag(event, edit)}
                              onLostPointerCapture={(event) => endTextDrag(event, edit)}
                              onClick={() => { setSelectedId(edit.id); setMode("select"); }}
                              role="button"
                              tabIndex={0}
                              aria-label={`Select and drag text: ${edit.text}`}
                              onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedId(edit.id); } }}
                            >{edit.text}</div>}
                            {selectedId === edit.id && renderResizeHandles(edit, {
                              left: `${(dragPreview?.id === edit.id ? dragPreview.x : edit.x) * 100}%`,
                              top: `${(dragPreview?.id === edit.id ? dragPreview.y : edit.y) * 100}%`,
                              width: `${textBoxWidth}%`,
                              height: `${textBoxHeight}px`,
                            })}
                          </Fragment>
                        ) : edit.kind === "cover" ? (
                          <button
                            key={edit.id}
                            type="button"
                            aria-label="Select covered area"
                            className={`${styles.coverEdit} ${selectedId === edit.id ? styles.selectedEdit : ""}`}
                            style={{ left: `${edit.x * 100}%`, top: `${edit.y * 100}%`, width: `${(edit.width ?? 0) * 100}%`, height: `${(edit.height ?? 0) * 100}%` }}
                            onPointerDown={(event) => { event.stopPropagation(); setSelectedId(edit.id); setMode("select"); }}
                            onClick={() => { setSelectedId(edit.id); setMode("select"); }}
                          />
                        ) : null
                      })}
                      {dragCover && <div className={styles.coverPreview} style={{ left: `${dragCover.x * 100}%`, top: `${dragCover.y * 100}%`, width: `${dragCover.width * 100}%`, height: `${dragCover.height * 100}%` }} />}
                    </div>
                  </div>
                </div>
                <p className={styles.pageTip}>PDFium updates the original text object and its styling. The page preview and downloaded PDF show supported replacements.</p>
                {previewError && <p className={styles.error} role="alert">{previewError}</p>}
                <div className={`${styles.exportArea} ${styles.mobileExport}`}>
                  <span>{readyEditCount} {readyEditCount === 1 ? "EDIT" : "EDITS"} READY</span>
                  <button className={styles.primaryButton} type="button" disabled={busy || previewBusy || readyEditCount === 0} onClick={() => void exportPdf()}>
                    {busy ? "Preparing..." : "Download edited PDF"}<span aria-hidden="true">&#8595;</span>
                  </button>
                  <p>Existing text edits keep the PDF object styling. Erasing removes detected PDF objects. Blank-area covers only hide content visually.</p>
                </div>
              </div>

              <aside className={styles.toolPanel} aria-label="Editing tools">
                <span className={styles.panelIndex}>02 / EDIT THE PAGE</span>
                <h2>Make it yours.</h2>
                  <div className={styles.modeButtons}>
                  <button type="button" className={mode === "select" ? styles.activeMode : ""} onClick={() => setMode("select")}><span>A</span>Select</button>
                  <button type="button" className={mode === "move" ? styles.activeMode : ""} onClick={() => { setMode("move"); setSelectedId(null); setSelectedSourceRun(null); setSourceTarget(null); }}><span>+</span>Move</button>
                  <button type="button" className={mode === "text" ? styles.activeMode : ""} onClick={() => { setMode("text"); setSelectedId(null); setSelectedSourceRun(null); setSourceTarget(null); setFont("Helvetica"); setBold(false); }}><span>T</span>Add text</button>
                  <button type="button" className={mode === "erase" ? styles.activeMode : ""} onClick={() => { setMode("erase"); setSelectedId(null); setSelectedSourceRun(null); setSourceTarget(null); }}><span>&#215;</span>Erase</button>
                </div>
                <div className={styles.historyButtons} aria-label="Edit history">
                  <button type="button" disabled={!history.past.length} onClick={undo} aria-label="Undo last edit">&#8630; Undo</button>
                  <button type="button" disabled={!history.future.length} onClick={redo} aria-label="Redo last undone edit">&#8631; Redo</button>
                </div>
                {(mode === "text" || editingExistingText || selectedEdit?.kind === "text") && <div className={styles.toolFields}>
                  <div className={styles.fieldPair}>
                    <label>Size
                      <input type="number" min="8" max="72" value={activeFontSize} onChange={(event) => updateSelectedText("fontSize", Math.min(72, Math.max(8, Number(event.target.value) || 8)))} disabled={editingExistingText} />
                    </label>
                    <label>Color
                      <span className={styles.colorInput}><input type="color" aria-label="Text color" value={activeColor} onChange={(event) => updateSelectedText("color", event.target.value)} disabled={editingExistingText} /><span>{activeColor.toUpperCase()}</span></span>
                    </label>
                  </div>
                  {!editingExistingText && <>
                    <label className={styles.fullField}>Font
                      <select value={activeFont} onChange={(event) => updateSelectedText("font", event.target.value)}>
                        {detectedFonts.map((name) => <option key={name} value={name}>Detected: {name} (closest available)</option>)}
                        <option>Arial</option><option>Calibri</option><option>Aptos</option><option>Georgia</option><option>Times New Roman</option><option>Verdana</option><option>Helvetica</option><option>Times Roman</option><option>Courier</option><option>Courier New</option>
                      </select>
                    </label>
                  </>}
                </div>}
                <p className={styles.toolHint}>{editingExistingText ? "Original PDF styling is preserved. Longer replacement text may not fit." : mode === "text" ? "Tap a blank area to place text. Drag the text box to move it; use its corner dots to resize." : mode === "move" ? "Drag detected PDF objects or added text. Use the selected element's corner dots to resize." : mode === "erase" ? "Tap a detected PDF object to remove it. Drag blank space to add a visual cover; hidden content remains in the file." : selectedEdit ? "Tap to edit added text or drag the text box to move it. Use its corner dots to resize." : visibleTextRuns.length ? "Tap existing text to edit it directly on the page." : "No selectable text found on this page. It may be a scan; use Add text or Erase instead."}</p>
                {pageObjectsError && <p className={styles.error} role="status">{pageObjectsError}</p>}
                {selectedEdit && <div className={styles.selectedActions}>
                  {(selectedEdit.kind === "text" || selectedEdit.kind === "replace" || selectedEdit.kind === "move") && <div className={styles.resizeActions} aria-label="Resize selected element">
                    <span>SIZE</span>
                    <button type="button" aria-label="Decrease selected element size" onClick={() => resizeSelectedBy(-1)}>&minus;</button>
                    <button type="button" aria-label="Increase selected element size" onClick={() => resizeSelectedBy(1)}>+</button>
                  </div>}
                  {(selectedEdit.kind === "text" || selectedEdit.kind === "replace" || selectedEdit.kind === "move") && <div className={styles.nudgeControls} aria-label="Move selected item">
                    <button type="button" aria-label="Move up" onClick={() => moveSelected(0, -.005)}>&#8593;</button>
                    <button type="button" aria-label="Move left" onClick={() => moveSelected(-.005, 0)}>&#8592;</button>
                    <button type="button" aria-label="Move down" onClick={() => moveSelected(0, .005)}>&#8595;</button>
                    <button type="button" aria-label="Move right" onClick={() => moveSelected(.005, 0)}>&#8594;</button>
                    <span>Fine position</span>
                  </div>}
                  <button type="button" className={styles.removeEdit} onClick={removeSelected}>Remove selected edit <span>&#215;</span></button>
                </div>}
                <div className={`${styles.exportArea} ${styles.desktopExport}`}>
                  <span>{readyEditCount} {readyEditCount === 1 ? "EDIT" : "EDITS"} READY</span>
                  <button className={styles.primaryButton} type="button" disabled={busy || previewBusy || readyEditCount === 0} onClick={() => void exportPdf()}>
                    {busy ? "Preparing..." : "Download edited PDF"}<span aria-hidden="true">&#8595;</span>
                  </button>
                  <p>Existing text edits keep the PDF object styling. Erasing removes detected PDF objects. Blank-area covers only hide content visually.</p>
                </div>
              </aside>
            </div>
            {error && <p className={styles.error} role="alert">{error}</p>}
            {renderDiagnostics && <details className={styles.diagnostics} open>
              <summary>PDF render diagnostics (send this to support)</summary>
              <pre>{renderDiagnostics}</pre>
            </details>}
          </section>
        )}
        <footer className={styles.footerNote}><span>TRUDEV / PDF EDITOR</span><span>LOCAL FILE &middot; YOUR CONTROL</span></footer>
      </main>
    </>
  );
}
