import { copyFile, cp } from "node:fs/promises";

const source = new URL("../node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url);
const destination = new URL("../public/pdfjs-worker.mjs", import.meta.url);

await copyFile(source, destination);

const pdfJsAssets = [
  ["cmaps", "pdfjs-cmaps"],
  ["iccs", "pdfjs-iccs"],
  ["standard_fonts", "pdfjs-standard-fonts"],
  ["wasm", "pdfjs-wasm"],
];

await Promise.all(pdfJsAssets.map(([sourceName, destinationName]) => cp(
  new URL(`../node_modules/pdfjs-dist/${sourceName}/`, import.meta.url),
  new URL(`../public/${destinationName}/`, import.meta.url),
  { recursive: true, force: true },
)));
