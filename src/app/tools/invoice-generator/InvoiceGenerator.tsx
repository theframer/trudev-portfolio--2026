"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import CustomCursor from "@/components/CustomCursor";
import styles from "./invoice-generator.module.css";

type InvoiceItem = { id: number; description: string; quantity: string; price: string };
type InvoiceDetails = {
  business: string;
  instagram: string;
  invoiceNumber: string;
  issueDate: string;
  customer: string;
  currency: string;
  taxRate: string;
  notes: string;
};

const currencies = ["INR", "USD", "EUR", "GBP", "AUD"];
const initialDetails: InvoiceDetails = {
  business: "",
  instagram: "",
  invoiceNumber: "",
  issueDate: "",
  customer: "",
  currency: "INR",
  taxRate: "0",
  notes: "",
};

function amount(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  if (!value) return "\u2014";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

export default function InvoiceGenerator() {
  const [details, setDetails] = useState(initialDetails);
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: 1, description: "", quantity: "1", price: "" },
  ]);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const businessSectionRef = useRef<HTMLDetailsElement>(null);
  const invoiceSectionRef = useRef<HTMLDetailsElement>(null);
  const itemsSectionRef = useRef<HTMLDetailsElement>(null);

  const businessMissing = showValidation && !details.business.trim();
  const issueDateMissing = showValidation && !details.issueDate.trim();
  const customerMissing = showValidation && !details.customer.trim();

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + amount(item.quantity) * amount(item.price),
      0,
    );
    const tax = subtotal * (amount(details.taxRate) / 100);
    return { subtotal, tax, total: subtotal + tax };
  }, [details.taxRate, items]);

  function updateDetails(field: keyof InvoiceDetails, value: string) {
    setValidationMessage("");
    setDetails((current) => ({ ...current, [field]: value }));
  }

  function updateItem(id: number, field: keyof Omit<InvoiceItem, "id">, value: string) {
    setValidationMessage("");
    setItems((current) => current.map((item) =>
      item.id === id ? { ...item, [field]: value } : item,
    ));
  }

  async function downloadInvoice() {
    const hasMissingRequiredField =
      !details.business.trim() ||
      !details.issueDate.trim() ||
      !details.customer.trim() ||
      items.some((item) =>
        !item.description.trim() || !item.quantity.trim() || !item.price.trim(),
      );

    if (hasMissingRequiredField) {
      setShowValidation(true);
      setValidationMessage("Mandatory field found empty. Please try again.");
      if (!details.business.trim() && businessSectionRef.current) businessSectionRef.current.open = true;
      if ((!details.issueDate.trim() || !details.customer.trim()) && invoiceSectionRef.current) {
        invoiceSectionRef.current.open = true;
      }
      if (items.some((item) => !item.description.trim() || !item.quantity.trim() || !item.price.trim())) {
        if (itemsSectionRef.current) itemsSectionRef.current.open = true;
      }
      return;
    }

    setValidationMessage("");
    setDownloading(true);
    setDownloadError("");
    try {
      const [{ pdf }, { InvoicePdf }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./InvoicePdf"),
      ]);
      const blob = await pdf(InvoicePdf({ details, items, totals })).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fileNumber = details.invoiceNumber.trim();
      link.href = url;
      link.download = `invoice${fileNumber ? `-${fileNumber.replace(/[^\w.-]+/g, "-")}` : ""}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setDownloadError("The PDF could not be created. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <CustomCursor />
      <main className={styles.page}>
        <div className={styles.toolbar}>
          <Link href="/#tools" className={styles.backLink}>&#8592; TRUDEV &middot; TOOLS</Link>
        </div>

        <header className={styles.heading}>
          <p className={styles.eyebrow}>FREE &middot; PRIVATE &middot; BROWSER BASED</p>
          <h1>INVOICE<br />GENERATOR.</h1>
          <p>Create a clear invoice, check the totals, and download a PDF. Your details stay on this device.</p>
        </header>

        <div className={styles.workspace}>
          <section className={styles.editor} aria-label="Invoice details form">
            <details className={styles.formSection} open ref={businessSectionRef}>
              <summary className={styles.sectionSummary}>
                <span className={styles.sectionNumber}>01</span>
                <span className={styles.sectionTitle}>Your business</span>
                <span className={styles.sectionAction}>
                  <span className={styles.expandLabel}>Expand to fill more details</span>
                  <span className={styles.collapseLabel}>Collapse</span>
                  <span className={styles.sectionArrow} aria-hidden="true" />
                </span>
              </summary>
              <div className={styles.fieldGrid}>
                <label className={styles.wideField}>Business or your name
                  <input value={details.business} onChange={(event) => updateDetails("business", event.target.value)} placeholder="Your business name" required aria-invalid={businessMissing} aria-describedby={businessMissing ? "business-error" : undefined} />
                  {businessMissing && <span className={styles.fieldError} id="business-error">This field is required.</span>}
                </label>
                <label className={styles.wideField}>Instagram Handle
                  <input value={details.instagram} onChange={(event) => updateDetails("instagram", event.target.value)} placeholder="instagram_handle or @instagram_handle" autoComplete="off" />
                </label>
              </div>
            </details>

            <details className={styles.formSection} ref={invoiceSectionRef}>
              <summary className={styles.sectionSummary}>
                <span className={styles.sectionNumber}>02</span>
                <span className={styles.sectionTitle}>Invoice details</span>
                <span className={styles.sectionAction}>
                  <span className={styles.expandLabel}>Expand to fill more details</span>
                  <span className={styles.collapseLabel}>Collapse</span>
                  <span className={styles.sectionArrow} aria-hidden="true" />
                </span>
              </summary>
              <div className={styles.fieldGrid}>
                <label>Invoice number
                  <input value={details.invoiceNumber} onChange={(event) => updateDetails("invoiceNumber", event.target.value)} placeholder="INV-001" />
                </label>
                <label>Issue date
                  <input type="date" value={details.issueDate} onChange={(event) => updateDetails("issueDate", event.target.value)} required aria-invalid={issueDateMissing} aria-describedby={issueDateMissing ? "issue-date-error" : undefined} />
                  {issueDateMissing && <span className={styles.fieldError} id="issue-date-error">This field is required.</span>}
                </label>
                <label className={styles.wideField}>Bill to / customer name
                  <input value={details.customer} onChange={(event) => updateDetails("customer", event.target.value)} placeholder="Customer name" required aria-invalid={customerMissing} aria-describedby={customerMissing ? "customer-error" : undefined} />
                  {customerMissing && <span className={styles.fieldError} id="customer-error">This field is required.</span>}
                </label>
                <label>Currency
                  <select value={details.currency} onChange={(event) => updateDetails("currency", event.target.value)}>
                    {currencies.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
                  </select>
                </label>
                <label>Tax rate (%)
                  <input type="number" min="0" step="0.01" value={details.taxRate} onChange={(event) => updateDetails("taxRate", event.target.value)} />
                </label>
              </div>
            </details>

            <details className={styles.formSection} ref={itemsSectionRef}>
              <summary className={styles.sectionSummary}>
                <span className={styles.sectionNumber}>03</span>
                <span className={styles.sectionTitle}>Items</span>
                <span className={styles.sectionAction}>
                  <span className={styles.expandLabel}>Expand to fill more details</span>
                  <span className={styles.collapseLabel}>Collapse</span>
                  <span className={styles.sectionArrow} aria-hidden="true" />
                </span>
              </summary>
              <div className={styles.itemHeaders} aria-hidden="true">
                <span>Description</span><span>Qty</span><span>Price</span><span />
              </div>
              <div className={styles.itemList}>
                {items.map((item, index) => (
                  <div className={styles.itemRow} key={item.id}>
                    <div className={styles.itemField}>
                      <label className={styles.srOnly} htmlFor={`item-description-${item.id}`}>Item {index + 1} description</label>
                      <input id={`item-description-${item.id}`} value={item.description} onChange={(event) => updateItem(item.id, "description", event.target.value)} placeholder="Product or service" required aria-invalid={showValidation && !item.description.trim()} aria-describedby={showValidation && !item.description.trim() ? `item-description-error-${item.id}` : undefined} />
                      {showValidation && !item.description.trim() && <span className={styles.fieldError} id={`item-description-error-${item.id}`}>Required</span>}
                    </div>
                    <div className={styles.itemField}>
                      <label className={styles.srOnly} htmlFor={`item-quantity-${item.id}`}>Item {index + 1} quantity</label>
                      <input id={`item-quantity-${item.id}`} type="number" min="0" step="0.01" value={item.quantity} onChange={(event) => updateItem(item.id, "quantity", event.target.value)} required aria-invalid={showValidation && !item.quantity.trim()} aria-describedby={showValidation && !item.quantity.trim() ? `item-quantity-error-${item.id}` : undefined} />
                      {showValidation && !item.quantity.trim() && <span className={styles.fieldError} id={`item-quantity-error-${item.id}`}>Required</span>}
                    </div>
                    <div className={styles.itemField}>
                      <label className={styles.srOnly} htmlFor={`item-price-${item.id}`}>Item {index + 1} price</label>
                      <input id={`item-price-${item.id}`} type="number" min="0" step="0.01" value={item.price} onChange={(event) => updateItem(item.id, "price", event.target.value)} placeholder="0.00" required aria-invalid={showValidation && !item.price.trim()} aria-describedby={showValidation && !item.price.trim() ? `item-price-error-${item.id}` : undefined} />
                      {showValidation && !item.price.trim() && <span className={styles.fieldError} id={`item-price-error-${item.id}`}>Required</span>}
                    </div>
                    <button type="button" className={styles.removeButton} aria-label={`Remove item ${index + 1}`} disabled={items.length === 1} onClick={() => setItems((current) => current.filter((row) => row.id !== item.id))}>&#215;</button>
                  </div>
                ))}
              </div>
              <button type="button" className={styles.addButton} onClick={() => setItems((current) => [...current, { id: Math.max(0, ...current.map((item) => item.id)) + 1, description: "", quantity: "1", price: "" }])}>+ Add item</button>
            </details>

            <details className={styles.formSection}>
              <summary className={styles.sectionSummary}>
                <span className={styles.sectionNumber}>04</span>
                <span className={styles.sectionTitle}>Notes</span>
                <span className={styles.sectionAction}>
                  <span className={styles.expandLabel}>Expand to fill more details</span>
                  <span className={styles.collapseLabel}>Collapse</span>
                  <span className={styles.sectionArrow} aria-hidden="true" />
                </span>
              </summary>
              <label className={styles.wideField}>Payment details or a short note
                <textarea rows={3} value={details.notes} onChange={(event) => updateDetails("notes", event.target.value)} placeholder="Optional details for your customer" />
              </label>
            </details>
          </section>

          <div className={styles.previewColumn}>
            <section className={styles.preview} aria-label="Invoice preview">
              <div className={styles.previewTop}>
                <div>
                  <p className={styles.previewLabel}>DRAFT</p>
                  <p className={styles.previewBusiness}>{details.business || "Your business name"}</p>
                  {details.instagram.trim() && (
                    <p className={styles.previewInstagram}>
                      @{details.instagram.trim().replace(/^@+/, "")}
                    </p>
                  )}
                </div>
                <p className={styles.previewNumber}>{details.invoiceNumber}</p>
              </div>
              <div className={styles.previewMeta}>
                <div><span>BILL TO</span><p>{details.customer || "Customer name"}</p></div>
                <div><span>ISSUED</span><p>{formatDate(details.issueDate)}</p></div>
              </div>
              <div className={styles.previewItems}>
                <div className={styles.previewItemHeader}><span>DESCRIPTION</span><span>QTY</span><span>PRICE</span><span>TOTAL</span></div>
                {items.map((item) => (
                  <div className={styles.previewItem} key={item.id}>
                    <span>{item.description || "Item description"}</span>
                    <span>{amount(item.quantity)}</span>
                    <span>{formatMoney(amount(item.price), details.currency)}</span>
                    <span>{formatMoney(amount(item.quantity) * amount(item.price), details.currency)}</span>
                  </div>
                ))}
              </div>
              <div className={styles.previewTotals}>
                <p><span>Subtotal</span><span>{formatMoney(totals.subtotal, details.currency)}</span></p>
                <p><span>Tax ({amount(details.taxRate)}%)</span><span>{formatMoney(totals.tax, details.currency)}</span></p>
                <p className={styles.totalLine}><span>Total</span><span>{formatMoney(totals.total, details.currency)}</span></p>
              </div>
              {details.notes && <div className={styles.previewNote}><span>NOTE</span><p>{details.notes}</p></div>}
            </section>
            <p className={styles.privacyNote}>Your invoice stays on this device. Download a PDF copy below.</p>
            <button type="button" className={styles.downloadButton} onClick={downloadInvoice} disabled={downloading}>
              {downloading ? "Preparing your PDF..." : "Download Invoice"}
              {!downloading && <span aria-hidden="true">&#8595;</span>}
            </button>
            {validationMessage && <p className={styles.downloadError} role="alert" aria-live="polite">{validationMessage}</p>}
            {downloadError && <p className={styles.downloadError} role="alert">{downloadError}</p>}
          </div>
        </div>
      </main>
    </>
  );
}
