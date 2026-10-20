import type { Metadata } from "next";
import InvoiceGenerator from "./InvoiceGenerator";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Free Invoice Generator Online",
  description:
    "Create a professional invoice online for free. Add line items, tax, and currency, preview the total, and download a PDF. Your details stay on your device.",
  alternates: { canonical: "/tools/invoice-generator/" },
  openGraph: {
    type: "website",
    url: absoluteUrl("/tools/invoice-generator/"),
    title: `Free Invoice Generator Online | ${SITE_NAME}`,
    description:
      "Create an invoice with line items, tax, and currency. Preview and download a PDF for free; your details stay on your device.",
    siteName: SITE_NAME,
    locale: "en_IN",
  },
  twitter: {
    card: "summary",
    title: `Free Invoice Generator Online | ${SITE_NAME}`,
    description:
      "Create, preview, and download a PDF invoice for free. Your details stay on your device.",
  },
};

export default function InvoiceGeneratorPage() {
  const softwareApplication = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "TRUDEV Free Invoice Generator",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    url: absoluteUrl("/tools/invoice-generator/"),
    description:
      "A free browser-based invoice maker that calculates totals and downloads invoices as PDF files. Invoice details stay on the user's device.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    featureList: [
      "Create an invoice with business and customer details",
      "Add line items and calculate totals",
      "Choose a currency and tax rate",
      "Preview and download an invoice as PDF",
      "Local processing without an account",
    ],
  };

  return (
    <>
      <InvoiceGenerator />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplication).replace(/</g, "\\u003c"),
        }}
      />
      <section
        className="tool-seo-content"
        aria-labelledby="invoice-generator-seo-title"
      >
        <div>
          <p className="section-eyebrow">FREE BROWSER TOOL</p>
          <h2 id="invoice-generator-seo-title">
            Free online invoice generator
          </h2>
          <p>
            Create an invoice online with your business name, customer details,
            issue date, currency, tax rate, and line items. The invoice preview
            updates as you work, and you can download the finished invoice as a
            PDF. Your information stays in your browser.
          </p>
          <h3>How to make an invoice</h3>
          <ol>
            <li>Enter your business name, customer name, and issue date.</li>
            <li>Add each product or service, quantity, and price.</li>
            <li>Check the invoice preview and download your PDF.</li>
          </ol>
          <h3>Invoice generator questions</h3>
          <h4>Can I create and download an invoice for free?</h4>
          <p>
            Yes. The invoice generator is free to use and exports the completed
            invoice as a PDF.
          </p>
          <h4>Does the invoice generator store my information?</h4>
          <p>
            No. Your invoice details are handled in your browser and are not
            sent to TRUDEV.
          </p>
          <h4>Can I add tax and different currencies?</h4>
          <p>
            Yes. Choose a currency, enter a tax rate, and add one or more line
            items. The preview calculates the subtotal, tax, and total.
          </p>
        </div>
      </section>
    </>
  );
}
