import type { Metadata } from "next";
import PdfEditor from "./PdfEditor";

export const metadata: Metadata = {
  title: "Free PDF Editor Online",
  description:
    "Edit supported PDF text online for free. Move or erase detected page objects, add text, and download your edited PDF. Your file stays on your device.",
  alternates: { canonical: "/tools/pdf-editor/" },
  openGraph: {
    type: "website",
    url: "https://trudev.in/tools/pdf-editor/",
    title: "Free PDF Editor Online | TRUDEV",
    description:
      "Edit supported PDF text, move or erase detected objects, and add text in your browser. Files stay on your device.",
    siteName: "TRUDEV",
    locale: "en_IN",
  },
  twitter: {
    card: "summary",
    title: "Free PDF Editor Online | TRUDEV",
    description:
      "Edit supported PDF text, move or erase detected objects, and add text. Your file stays on your device.",
  },
};

export default function PdfEditorPage() {
  const softwareApplication = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "TRUDEV Free PDF Editor",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    url: "https://trudev.in/tools/pdf-editor/",
    description:
      "A free, browser-based PDF editor for supported text and page objects. Files are processed on the user's device.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    featureList: [
      "Edit supported PDF text in place",
      "Move or erase detected PDF page objects",
      "Add, move, and resize text",
      "Download an edited PDF",
      "Local file processing in the browser",
    ],
  };

  return (
    <>
      <PdfEditor />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplication).replace(/</g, "\\u003c") }}
      />
      <section className="tool-seo-content" aria-labelledby="pdf-editor-seo-title">
        <div>
          <p className="section-eyebrow">FREE BROWSER TOOL</p>
          <h2 id="pdf-editor-seo-title">Free online PDF editor</h2>
          <p>
            Use the TRUDEV PDF editor to change supported text in a PDF, add text, move detected page objects, or erase them. Review the page preview and download the edited PDF when you are ready. The document is processed in your browser and is not uploaded to TRUDEV.
          </p>
          <h3>How to edit a PDF</h3>
          <ol>
            <li>Choose a PDF from your device.</li>
            <li>Select text or a page object, or choose Add text or Erase.</li>
            <li>Review your changes in the preview, then download the edited PDF.</li>
          </ol>
          <h3>PDF editor questions</h3>
          <h4>Is this PDF editor free?</h4>
          <p>Yes. You can use the editor and download your edited PDF without creating an account.</p>
          <h4>Does TRUDEV upload or store my PDF?</h4>
          <p>No. Your selected document stays on your device and is processed locally in your browser.</p>
          <h4>Can I edit text in every PDF?</h4>
          <p>The editor supports detected PDF text and page objects. Scanned pages that contain only an image do not have editable text unless you add new text over the page.</p>
        </div>
      </section>
    </>
  );
}
