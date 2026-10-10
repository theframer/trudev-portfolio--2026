import type { WrappedPdfiumModule } from "@embedpdf/pdfium";

export type PdfiumTextTarget = {
  objectIndex: number;
  text: string;
  bounds: { left: number; bottom: number; right: number; top: number };
  fontFamily: string;
  fontSize: number;
  bold: boolean;
  color: string;
};

export type PdfiumTextChange = {
  page: number;
  objectIndex: number;
  originalText: string;
  text: string;
  originalBounds: PdfiumTextTarget["bounds"];
};

export type PdfiumPageObject = {
  objectIndex: number;
  type: number;
  bounds: { left: number; bottom: number; right: number; top: number };
};

export type PdfiumObjectChange = {
  page: number;
  objectIndex: number;
  dx: number;
  dy: number;
  erase?: boolean;
};

let libraryPromise: Promise<WrappedPdfiumModule> | null = null;

function heap(pdfium: WrappedPdfiumModule) {
  return (pdfium.pdfium as typeof pdfium.pdfium & { HEAPU8: Uint8Array }).HEAPU8;
}

async function getLibrary() {
  if (!libraryPromise) {
    libraryPromise = import("@embedpdf/pdfium").then(async ({ init }) => {
      const pdfium = await init({});
      pdfium.PDFiumExt_Init();
      pdfium.FPDF_InitLibrary();
      return pdfium;
    });
  }
  return libraryPromise;
}

function alloc(pdfium: WrappedPdfiumModule, size: number) {
  const pointer = pdfium.pdfium.wasmExports.malloc(size);
  if (!pointer) throw new Error("PDF engine ran out of memory.");
  return pointer;
}

function normalizeText(text: string) {
  return text.normalize("NFKC").replace(/\s+/g, "").toLocaleLowerCase();
}

function readObjectBounds(pdfium: WrappedPdfiumModule, object: number) {
  const left = alloc(pdfium, 4);
  const bottom = alloc(pdfium, 4);
  const right = alloc(pdfium, 4);
  const top = alloc(pdfium, 4);
  try {
    if (!pdfium.FPDFPageObj_GetBounds(object, left, bottom, right, top)) {
      throw new Error("PDFium could not read this text object's bounds.");
    }
    return {
      left: pdfium.pdfium.getValue(left, "float") as number,
      bottom: pdfium.pdfium.getValue(bottom, "float") as number,
      right: pdfium.pdfium.getValue(right, "float") as number,
      top: pdfium.pdfium.getValue(top, "float") as number,
    };
  } finally {
    pdfium.pdfium.wasmExports.free(left);
    pdfium.pdfium.wasmExports.free(bottom);
    pdfium.pdfium.wasmExports.free(right);
    pdfium.pdfium.wasmExports.free(top);
  }
}

function readTextColor(pdfium: WrappedPdfiumModule, object: number) {
  const channels = [0, 1, 2, 3].map(() => alloc(pdfium, 4));
  try {
    if (!pdfium.FPDFPageObj_GetFillColor(object, channels[0], channels[1], channels[2], channels[3])) return "#111111";
    const [red, green, blue] = channels.map((pointer) =>
      Number(pdfium.pdfium.getValue(pointer, "i32")) & 0xff,
    );
    return `#${[red, green, blue].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
  } finally {
    channels.forEach((pointer) => pdfium.pdfium.wasmExports.free(pointer));
  }
}

function readTextObjectText(
  pdfium: WrappedPdfiumModule,
  textPage: number,
  object: number,
  charCount: number,
) {
  let start = 0;
  while (start < charCount && pdfium.FPDFText_GetTextObject(textPage, start) !== object) start += 1;
  if (start === charCount) return "";

  let end = start + 1;
  while (end < charCount && pdfium.FPDFText_GetTextObject(textPage, end) === object) end += 1;

  const buffer = alloc(pdfium, (end - start + 1) * 2);
  try {
    pdfium.FPDFText_GetText(textPage, start, end - start, buffer);
    return pdfium.pdfium.UTF16ToString(buffer);
  } finally {
    pdfium.pdfium.wasmExports.free(buffer);
  }
}

function readFontName(pdfium: WrappedPdfiumModule, object: number) {
  const font = pdfium.FPDFTextObj_GetFont(object);
  if (!font) return "Unknown PDF font";
  const buffer = alloc(pdfium, 256);
  try {
    pdfium.FPDFFont_GetBaseFontName(font, buffer, 256);
    return pdfium.pdfium.UTF8ToString(buffer).replace(/^[A-Z]{6}\+/, "") || "Unknown PDF font";
  } finally {
    pdfium.pdfium.wasmExports.free(buffer);
  }
}

async function withDocument<T>(bytes: Uint8Array, action: (pdfium: WrappedPdfiumModule, document: number) => T) {
  const pdfium = await getLibrary();
  const inputPointer = alloc(pdfium, bytes.byteLength);
  heap(pdfium).set(bytes, inputPointer);
  let document = 0;
  try {
    document = pdfium.FPDF_LoadMemDocument(inputPointer, bytes.byteLength, "");
    if (!document) throw new Error("PDFium could not open this PDF. It may be encrypted or damaged.");
    return action(pdfium, document);
  } finally {
    if (document) pdfium.FPDF_CloseDocument(document);
    pdfium.pdfium.wasmExports.free(inputPointer);
  }
}

export async function locatePdfiumText(
  bytes: Uint8Array,
  pageIndex: number,
  normalizedX: number,
  normalizedY: number,
  normalizedWidth: number,
  normalizedHeight: number,
  expectedText: string,
): Promise<PdfiumTextTarget> {
  return withDocument(bytes, (pdfium, document) => {
    const page = pdfium.FPDF_LoadPage(document, pageIndex);
    if (!page) throw new Error("PDFium could not open this page.");
    const textPage = pdfium.FPDFText_LoadPage(page);
    if (!textPage) {
      pdfium.FPDF_ClosePage(page);
      throw new Error("This page has no editable text layer.");
    }
    try {
      const pageWidth = pdfium.FPDF_GetPageWidth(page);
      const pageHeight = pdfium.FPDF_GetPageHeight(page);
      const x = (normalizedX + normalizedWidth / 2) * pageWidth;
      const y = (1 - normalizedY - normalizedHeight / 2) * pageHeight;
      const charIndex = pdfium.FPDFText_GetCharIndexAtPos(
        textPage,
        x,
        y,
        Math.max(3, normalizedWidth * pageWidth * 0.35),
        Math.max(3, normalizedHeight * pageHeight * 0.35),
      );
      if (charIndex < 0) throw new Error("This text cannot be mapped to an editable PDF text object.");

      const object = pdfium.FPDFText_GetTextObject(textPage, charIndex);
      if (!object || pdfium.FPDFPageObj_GetType(object) !== 1) {
        throw new Error("This text is not stored as an editable PDF text object.");
      }
      const objectText = readTextObjectText(pdfium, textPage, object, pdfium.FPDFText_CountChars(textPage));
      if (!objectText || normalizeText(objectText) !== normalizeText(expectedText)) {
        throw new Error("This selection contains mixed or grouped PDF text. It is left unchanged for safety.");
      }

      let objectIndex = -1;
      const objectCount = pdfium.FPDFPage_CountObjects(page);
      for (let index = 0; index < objectCount; index += 1) {
        if (pdfium.FPDFPage_GetObject(page, index) === object) {
          objectIndex = index;
          break;
        }
      }
      if (objectIndex < 0) throw new Error("Could not safely identify this text object in the PDF.");

      const sizePointer = alloc(pdfium, 4);
      try {
        if (!pdfium.FPDFTextObj_GetFontSize(object, sizePointer)) {
          throw new Error("Could not read the source font size.");
        }
        const fontSize = Number(pdfium.pdfium.getValue(sizePointer, "float"));
        const font = pdfium.FPDFTextObj_GetFont(object);
        const fontWeight = font ? pdfium.FPDFFont_GetWeight(font) : 400;
        const fontFamily = readFontName(pdfium, object);
        return {
          objectIndex,
          text: objectText,
          bounds: readObjectBounds(pdfium, object),
          fontFamily,
          fontSize,
          bold: fontWeight >= 600 || /bold|black|semibold/i.test(fontFamily),
          color: readTextColor(pdfium, object),
        };
      } finally {
        pdfium.pdfium.wasmExports.free(sizePointer);
      }
    } finally {
      pdfium.FPDFText_ClosePage(textPage);
      pdfium.FPDF_ClosePage(page);
    }
  });
}

export async function locatePdfiumPageObjects(bytes: Uint8Array, pageIndex: number): Promise<PdfiumPageObject[]> {
  return withDocument(bytes, (pdfium, document) => {
    const page = pdfium.FPDF_LoadPage(document, pageIndex);
    if (!page) throw new Error("PDFium could not open this page.");
    try {
      const objects: PdfiumPageObject[] = [];
      const count = pdfium.FPDFPage_CountObjects(page);
      for (let objectIndex = 0; objectIndex < count; objectIndex += 1) {
        const object = pdfium.FPDFPage_GetObject(page, objectIndex);
        if (!object) continue;
        const type = pdfium.FPDFPageObj_GetType(object);
        if (type < 1 || type > 4) continue;
        try {
          const bounds = readObjectBounds(pdfium, object);
          if (![bounds.left, bounds.bottom, bounds.right, bounds.top].every(Number.isFinite)) continue;
          if (bounds.right - bounds.left <= 0 || bounds.top - bounds.bottom <= 0) continue;
          objects.push({ objectIndex, type, bounds });
        } catch {
          // Objects without reliable bounds cannot be selected safely.
        }
      }
      return objects;
    } finally {
      pdfium.FPDF_ClosePage(page);
    }
  });
}

export async function applyPdfiumObjectChanges(bytes: Uint8Array, changes: PdfiumObjectChange[]) {
  if (!changes.length) return bytes;
  return withDocument(bytes, (pdfium, document) => {
    const changesByPage = new Map<number, PdfiumObjectChange[]>();
    for (const change of changes) {
      const items = changesByPage.get(change.page) ?? [];
      items.push(change);
      changesByPage.set(change.page, items);
    }
    for (const [pageNumber, pageChanges] of changesByPage) {
      const page = pdfium.FPDF_LoadPage(document, pageNumber - 1);
      if (!page) throw new Error("Could not open a page that contains a move or erase edit.");
      try {
        const count = pdfium.FPDFPage_CountObjects(page);
        for (const change of pageChanges.filter((item) => !item.erase)) {
          const object = pdfium.FPDFPage_GetObject(page, change.objectIndex);
          if (!object) throw new Error("A selected PDF object is unavailable. Reload the original PDF and try again.");
          pdfium.FPDFPageObj_Transform(object, 1, 0, 0, 1, change.dx, change.dy);
        }
        const eraseChanges = pageChanges.filter((item) => item.erase).sort((a, b) => b.objectIndex - a.objectIndex);
        for (const change of eraseChanges) {
          if (change.objectIndex >= count) throw new Error("A selected PDF object is unavailable. Reload the original PDF and try again.");
          const object = pdfium.FPDFPage_GetObject(page, change.objectIndex);
          if (!object || !pdfium.FPDFPage_RemoveObject(page, object)) {
            throw new Error("PDFium could not remove the selected page object.");
          }
          pdfium.FPDFPageObj_Destroy(object);
        }
        if (!pdfium.FPDFPage_GenerateContent(page)) throw new Error("Could not write the moved or erased PDF content.");
      } finally {
        pdfium.FPDF_ClosePage(page);
      }
    }
    const writer = pdfium.PDFiumExt_OpenFileWriter();
    if (!writer) throw new Error("Could not prepare the edited PDF for download.");
    try {
      if (!pdfium.PDFiumExt_SaveAsCopy(document, writer)) throw new Error("PDFium could not save the page object edits.");
      const size = pdfium.PDFiumExt_GetFileWriterSize(writer);
      if (!size) throw new Error("The edited PDF was empty.");
      const outputPointer = alloc(pdfium, size);
      try {
        if (pdfium.PDFiumExt_GetFileWriterData(writer, outputPointer, size) !== size) throw new Error("The edited PDF could not be read back safely.");
        return heap(pdfium).slice(outputPointer, outputPointer + size);
      } finally {
        pdfium.pdfium.wasmExports.free(outputPointer);
      }
    } finally {
      pdfium.PDFiumExt_CloseFileWriter(writer);
    }
  });
}

export async function applyPdfiumTextChanges(bytes: Uint8Array, changes: PdfiumTextChange[]) {
  if (!changes.length) return bytes;
  return withDocument(bytes, (pdfium, document) => {
    const changesByPage = new Map<number, PdfiumTextChange[]>();
    for (const change of changes) {
      const pageChanges = changesByPage.get(change.page) ?? [];
      pageChanges.push(change);
      changesByPage.set(change.page, pageChanges);
    }

    for (const [pageNumber, pageChanges] of changesByPage) {
      const page = pdfium.FPDF_LoadPage(document, pageNumber - 1);
      if (!page) throw new Error("Could not open a page that contains a text edit.");
      try {
        for (const change of pageChanges) {
          const object = pdfium.FPDFPage_GetObject(page, change.objectIndex);
          if (!object || pdfium.FPDFPageObj_GetType(object) !== 1) {
            throw new Error("A selected text object is no longer available. Reload the PDF and try again.");
          }
          const currentTextPage = pdfium.FPDFText_LoadPage(page);
          if (!currentTextPage) throw new Error("Could not verify the selected text before editing.");
          let currentText: string;
          try {
            currentText = readTextObjectText(
              pdfium,
              currentTextPage,
              object,
              pdfium.FPDFText_CountChars(currentTextPage),
            );
          } finally {
            pdfium.FPDFText_ClosePage(currentTextPage);
          }
          if (normalizeText(currentText) !== normalizeText(change.originalText)) {
            throw new Error("The source text changed. Reload the original PDF before applying edits.");
          }

          const textPointer = alloc(pdfium, (change.text.length + 1) * 2);
          try {
            pdfium.pdfium.stringToUTF16(change.text, textPointer, (change.text.length + 1) * 2);
            if (!pdfium.FPDFText_SetText(object, textPointer)) {
              throw new Error("The embedded font cannot safely render this replacement. The PDF was not exported.");
            }
          } finally {
            pdfium.pdfium.wasmExports.free(textPointer);
          }

          const newBounds = readObjectBounds(pdfium, object);
          const originalWidth = change.originalBounds.right - change.originalBounds.left;
          const newWidth = newBounds.right - newBounds.left;
          const widthTolerance = Math.max(1.5, originalWidth * 0.015);
          if (newWidth > originalWidth + widthTolerance) {
            throw new Error("This replacement is wider than the original text and could disrupt the layout. Use shorter text to keep the PDF aligned.");
          }
        }
        // Generate the stream before closing this same page handle so PDFium
        // serializes the modified in-memory page objects instead of reloading
        // the untouched source content stream.
        if (!pdfium.FPDFPage_GenerateContent(page)) {
          throw new Error("Could not write the updated PDF text content.");
        }
      } finally {
        pdfium.FPDF_ClosePage(page);
      }
    }

    const writer = pdfium.PDFiumExt_OpenFileWriter();
    if (!writer) throw new Error("Could not prepare the edited PDF for download.");
    try {
      if (!pdfium.PDFiumExt_SaveAsCopy(document, writer)) {
        throw new Error("PDFium could not save the text edits.");
      }
      const size = pdfium.PDFiumExt_GetFileWriterSize(writer);
      if (!size) throw new Error("The edited PDF was empty.");
      const outputPointer = alloc(pdfium, size);
      try {
        const copied = pdfium.PDFiumExt_GetFileWriterData(writer, outputPointer, size);
        if (copied !== size) throw new Error("The edited PDF could not be read back safely.");
        return heap(pdfium).slice(outputPointer, outputPointer + size);
      } finally {
        pdfium.pdfium.wasmExports.free(outputPointer);
      }
    } finally {
      pdfium.PDFiumExt_CloseFileWriter(writer);
    }
  });
}
