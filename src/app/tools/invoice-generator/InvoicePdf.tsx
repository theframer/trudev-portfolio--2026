import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

type InvoiceItem = {
  id: number;
  description: string;
  quantity: string;
  price: string;
};
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
type Totals = { subtotal: number; tax: number; total: number };

const styles = StyleSheet.create({
  page: {
    padding: 42,
    color: "#171717",
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 22,
    borderBottomWidth: 1,
    borderBottomColor: "#bdbdbd",
  },
  eyebrow: {
    color: "#6b6b6b",
    fontSize: 8,
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  business: { fontFamily: "Helvetica-Bold", fontSize: 19, maxWidth: 320 },
  instagram: { color: "#666", fontSize: 7, marginTop: 4 },
  invoiceTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 26,
    textAlign: "right",
  },
  invoiceNumber: {
    color: "#666",
    fontSize: 10,
    textAlign: "right",
    marginTop: 6,
  },
  meta: {
    flexDirection: "row",
    paddingVertical: 22,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  metaColumn: { width: "50%" },
  label: { color: "#6b6b6b", fontSize: 8, letterSpacing: 1, marginBottom: 6 },
  value: { fontSize: 11 },
  table: { marginTop: 22 },
  tableHead: {
    flexDirection: "row",
    paddingVertical: 9,
    backgroundColor: "#171717",
    color: "#fff",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 0.6,
    borderBottomColor: "#d5d5d5",
  },
  cell: { paddingHorizontal: 7 },
  description: { width: "48%" },
  quantity: { width: "12%", textAlign: "right" },
  price: { width: "20%", textAlign: "right" },
  lineTotal: { width: "20%", textAlign: "right" },
  totals: { width: "56%", marginLeft: "auto", marginTop: 18 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: "#888",
    marginTop: 5,
    paddingTop: 12,
    fontFamily: "Helvetica-Bold",
    fontSize: 14,
  },
  note: {
    marginTop: 34,
    paddingTop: 14,
    borderTopWidth: 0.6,
    borderTopColor: "#ccc",
  },
  noteText: { fontSize: 10, lineHeight: 1.5 },
});

function money(value: number, currency: string) {
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  // Currency codes keep PDF output readable with the built-in Latin font.
  return `${currency} ${formatted}`;
}

function dateLabel(value: string) {
  if (!value) return "\u2014";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

export function InvoicePdf({
  details,
  items,
  totals,
}: {
  details: InvoiceDetails;
  items: InvoiceItem[];
  totals: Totals;
}) {
  return (
    <Document
      title={`Invoice${
        details.invoiceNumber.trim() ? ` ${details.invoiceNumber.trim()}` : ""
      }`}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>INVOICE</Text>
            <Text style={styles.business}>
              {details.business || "Your business name"}
            </Text>
            {details.instagram.trim() ? (
              <Text style={styles.instagram}>
                @{details.instagram.trim().replace(/^@+/, "")}
              </Text>
            ) : null}
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{details.invoiceNumber}</Text>
          </View>
        </View>

        <View style={styles.meta}>
          <View style={styles.metaColumn}>
            <Text style={styles.label}>BILL TO</Text>
            <Text style={styles.value}>
              {details.customer || "Customer name"}
            </Text>
          </View>
          <View style={styles.metaColumn}>
            <Text style={styles.label}>ISSUED</Text>
            <Text style={styles.value}>{dateLabel(details.issueDate)}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View
            style={[
              styles.tableHead,
              { fontFamily: "Helvetica-Bold", fontSize: 8 },
            ]}
          >
            <Text style={[styles.cell, styles.description]}>DESCRIPTION</Text>
            <Text style={[styles.cell, styles.quantity]}>QTY</Text>
            <Text style={[styles.cell, styles.price]}>PRICE</Text>
            <Text style={[styles.cell, styles.lineTotal]}>TOTAL</Text>
          </View>
          {items.map((item) => {
            const quantity =
              Number(item.quantity) > 0 ? Number(item.quantity) : 0;
            const price = Number(item.price) > 0 ? Number(item.price) : 0;
            return (
              <View key={item.id} style={styles.tableRow} wrap={false}>
                <Text style={[styles.cell, styles.description]}>
                  {item.description || "Item description"}
                </Text>
                <Text style={[styles.cell, styles.quantity]}>{quantity}</Text>
                <Text style={[styles.cell, styles.price]}>
                  {money(price, details.currency)}
                </Text>
                <Text style={[styles.cell, styles.lineTotal]}>
                  {money(quantity * price, details.currency)}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{money(totals.subtotal, details.currency)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Tax ({Number(details.taxRate) || 0}%)</Text>
            <Text>{money(totals.tax, details.currency)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text>Total</Text>
            <Text>{money(totals.total, details.currency)}</Text>
          </View>
        </View>

        {details.notes && (
          <View style={styles.note}>
            <Text style={[styles.label, { marginBottom: 8 }]}>NOTE</Text>
            <Text style={styles.noteText}>{details.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
