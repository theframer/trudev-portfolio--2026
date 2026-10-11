import { copyFile } from "node:fs/promises";

const source = new URL("../node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url);
const destination = new URL("../public/pdfjs-worker.mjs", import.meta.url);

await copyFile(source, destination);
