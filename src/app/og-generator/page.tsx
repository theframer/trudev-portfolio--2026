import type { Metadata } from "next";
import OgGenerator from "./OgGenerator";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Open Graph Metadata Generator",
  description:
    "Preview and copy Open Graph and Twitter card metadata for a page. Generate ready-to-paste meta tags and JSON-LD for link previews.",
  alternates: { canonical: "/og-generator/" },
  openGraph: {
    type: "website",
    url: absoluteUrl("/og-generator/"),
    title: `Open Graph Metadata Generator | ${SITE_NAME}`,
    description:
      "Preview and copy Open Graph and Twitter card metadata for a page, ready to paste into any site.",
    siteName: SITE_NAME,
    locale: "en_IN",
  },
  twitter: {
    card: "summary",
    title: `Open Graph Metadata Generator | ${SITE_NAME}`,
    description:
      "Preview and copy Open Graph and Twitter card metadata for a page.",
  },
};

export default function OgGeneratorPage() {
  const webApplication = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "TRUDEV Open Graph Metadata Generator",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    url: absoluteUrl("/og-generator/"),
    description:
      "A free browser-based generator for Open Graph and Twitter card metadata, with a live link-preview and copyable meta tags.",
    featureList: [
      "Enter a page title, description, and URL",
      "Preview the Open Graph and Twitter card link preview",
      "Copy ready-to-paste meta tags and JSON-LD",
      "Local processing without an account",
    ],
  };

  return (
    <>
      <OgGenerator />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webApplication).replace(/</g, "\\u003c"),
        }}
      />
      <section
        className="tool-seo-content"
        aria-labelledby="og-generator-seo-title"
      >
        <div>
          <p className="section-eyebrow">FREE BROWSER TOOL</p>
          <h2 id="og-generator-seo-title">Open Graph metadata generator</h2>
          <p>
            Build and preview Open Graph and Twitter card metadata for a page.
            Enter a title, description, URL, and image, then copy the generated
            meta tags or JSON-LD into your site.
          </p>
          <h3>How to generate Open Graph tags</h3>
          <ol>
            <li>Enter your page title, description, and canonical URL.</li>
            <li>Add an absolute image URL for the social preview.</li>
            <li>Preview the card and copy the generated tags.</li>
          </ol>
          <h3>Open Graph generator questions</h3>
          <h4>Is this metadata generator free?</h4>
          <p>Yes. It runs entirely in your browser with no account required.</p>
          <h4>Where should I paste the generated tags?</h4>
          <p>
            In the <code>&lt;head&gt;</code> of your HTML page. In Next.js App
            Router projects, put the equivalent values in each page&apos;s{" "}
            <code>metadata</code> export instead of raw tags.
          </p>
          <h4>Is my data sent anywhere?</h4>
          <p>
            No. Everything you type stays on your device; the preview is
            rendered locally.
          </p>
        </div>
      </section>
    </>
  );
}
