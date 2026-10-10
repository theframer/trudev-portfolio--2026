import type { Metadata } from "next";
import InvoiceGenerator from "./InvoiceGenerator";

export const metadata: Metadata = {
  title: "Free Invoice Generator",
  description:
    "Create an invoice with live totals and download a PDF. Free to use, with your details kept on your device.",
};

export default function InvoiceGeneratorPage() {
  return <InvoiceGenerator />;
}
