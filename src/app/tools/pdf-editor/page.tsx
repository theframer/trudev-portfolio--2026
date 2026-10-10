import type { Metadata } from "next";
import PdfEditor from "./PdfEditor";

export const metadata: Metadata = {
  title: "PDF Editor | TRUDEV",
  description:
    "Edit PDF text, move page elements, erase areas, and add text locally in your browser. Your file stays on your device.",
};

export default function PdfEditorPage() {
  return <PdfEditor />;
}
