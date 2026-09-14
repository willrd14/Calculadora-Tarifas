import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { calculateQuote } from "../../lib/calculate";
import { formatCurrency } from "../../lib/currency";
import type { FreelancerProfile } from "../settings/freelancerProfile";
import type { QuoteFormValues } from "../quote/schema";
import { DEFAULT_QUOTE_CONDITIONS } from "./quoteConditions";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    color: "#1a1a1a",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  freelancerName: { fontSize: 14, fontWeight: "bold" },
  muted: { color: "#666666" },
  title: { fontSize: 18, fontWeight: "bold", textAlign: "right" },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#666666",
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    paddingVertical: 6,
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
    paddingBottom: 4,
    fontWeight: "bold",
  },
  colName: { flex: 3 },
  colHours: { flex: 1, textAlign: "right" },
  colRate: { flex: 1, textAlign: "right" },
  colSubtotal: { flex: 1, textAlign: "right" },
  totalsBox: { marginTop: 12, alignSelf: "flex-end", width: 220 },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#1a1a1a",
  },
  totalLabel: { fontSize: 11, fontWeight: "bold" },
  totalValue: { fontSize: 11, fontWeight: "bold" },
  conditions: { fontSize: 8, color: "#666666", lineHeight: 1.4 },
});

interface QuoteDocumentProps {
  quote: QuoteFormValues;
  freelancer: FreelancerProfile;
  quoteNumber: string;
  date: Date;
}

/** Documento PDF de la cotización: encabezado, cliente, ítems, totales y condiciones. */
export function QuoteDocument({
  quote,
  freelancer,
  quoteNumber,
  date,
}: QuoteDocumentProps) {
  const result = calculateQuote({
    items: quote.items,
    hourlyRate: quote.hourlyRate,
    additionalCharges: quote.additionalCharges,
    discountPercent: quote.discountPercent,
  });

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.freelancerName}>{freelancer.name}</Text>
            {freelancer.email && <Text style={styles.muted}>{freelancer.email}</Text>}
            {freelancer.phone && <Text style={styles.muted}>{freelancer.phone}</Text>}
            {freelancer.portfolio && (
              <Text style={styles.muted}>{freelancer.portfolio}</Text>
            )}
          </View>
          <View>
            <Text style={styles.title}>COTIZACIÓN</Text>
            <Text style={styles.muted}>{quoteNumber}</Text>
            <Text style={styles.muted}>{date.toLocaleDateString("es-DO")}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente / Proyecto</Text>
          <Text>{quote.clientName}</Text>
          <Text style={styles.muted}>Tipo: {quote.projectType}</Text>
          {quote.description && (
            <Text style={styles.muted}>{quote.description}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Funcionalidades</Text>
          <View>
            <View style={styles.tableHeaderRow}>
              <Text style={styles.colName}>Funcionalidad</Text>
              <Text style={styles.colHours}>Horas</Text>
              <Text style={styles.colRate}>Tarifa/h</Text>
              <Text style={styles.colSubtotal}>Subtotal</Text>
            </View>
            {quote.items.map((item, index) => (
              <View style={styles.tableRow} key={index}>
                <Text style={styles.colName}>{item.name}</Text>
                <Text style={styles.colHours}>{item.hours}</Text>
                <Text style={styles.colRate}>
                  {formatCurrency(quote.hourlyRate, quote.currency)}
                </Text>
                <Text style={styles.colSubtotal}>
                  {formatCurrency(item.hours * quote.hourlyRate, quote.currency)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {quote.additionalCharges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cargos adicionales</Text>
            <View>
              {quote.additionalCharges.map((charge, index) => (
                <View style={styles.tableRow} key={index}>
                  <Text style={styles.colName}>{charge.name}</Text>
                  <Text style={styles.colSubtotal}>
                    {formatCurrency(charge.amount, quote.currency)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.totalsBox}>
          <View style={styles.totalsRow}>
            <Text>Subtotal</Text>
            <Text>{formatCurrency(result.subtotal, quote.currency)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text>Descuento ({quote.discountPercent}%)</Text>
            <Text>− {formatCurrency(result.discountAmount, quote.currency)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(result.total, quote.currency)}
            </Text>
          </View>
        </View>

        <View style={[styles.section, { marginTop: 32 }]}>
          <Text style={styles.sectionTitle}>Condiciones</Text>
          <Text style={styles.conditions}>
            Validez: {DEFAULT_QUOTE_CONDITIONS.validity}
          </Text>
          <Text style={styles.conditions}>
            Forma de pago: {DEFAULT_QUOTE_CONDITIONS.payment}
          </Text>
          <Text style={styles.conditions}>
            Entrega: {DEFAULT_QUOTE_CONDITIONS.delivery}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
