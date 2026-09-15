import { Document, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { calculateQuote } from "../../lib/calculate";
import { formatCurrency } from "../../lib/currency";
import { addDays, formatDateDMY } from "../../lib/date";
import type { FreelancerProfile } from "../settings/db";
import type { QuoteFormValues } from "../quote/schema";
import {
  COMPLEXITY_MULTIPLIERS,
  sumComplexityMultipliers,
} from "../quote/complexityMultipliers";
import { FONT_DISPLAY, FONT_MONO, FONT_SANS, registerPdfFonts } from "./fonts";
import { QUOTE_VALIDITY_DAYS } from "./quoteConditions";

registerPdfFonts();

// Paleta y tipografía replicadas de Template/Main.dc.html (ver Template/README.md).
const ACCENT = "#1d4ed8";
const COLOR_TEXT = "#1c1a17";
const COLOR_TEXT_SECONDARY = "#6b6459";
const COLOR_TEXT_MUTED = "#8a8276";
const COLOR_TEXT_FAINT = "#a39a8b";
const COLOR_TEXT_BODY = "#524c43";
const COLOR_DIVIDER = "#e5e1d8";
const COLOR_BOX_BG = "#f4f1ea";
const COLOR_BACKGROUND = "#fdfcfa";

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLOR_BACKGROUND,
    color: COLOR_TEXT,
    fontFamily: FONT_SANS,
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4.5,
    backgroundColor: ACCENT,
  },
  content: {
    paddingTop: 42,
    paddingRight: 42,
    paddingBottom: 48,
    paddingLeft: 42,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 18,
  },
  headerLeft: { flexDirection: "column", gap: 3 },
  brandName: {
    fontFamily: FONT_DISPLAY,
    fontWeight: 700,
    fontSize: 16.5,
  },
  tagline: { fontSize: 9.75, color: COLOR_TEXT_SECONDARY, lineHeight: 1.5 },
  contactLine: { fontSize: 9.75, color: COLOR_TEXT_SECONDARY, lineHeight: 1.5 },
  link: { color: ACCENT, textDecoration: "none" },
  headerRight: { flexDirection: "column", alignItems: "flex-end", gap: 4.5 },
  title: {
    fontFamily: FONT_DISPLAY,
    fontWeight: 700,
    fontSize: 21,
    color: ACCENT,
  },
  metaMono: { fontFamily: FONT_MONO, fontSize: 9, color: COLOR_TEXT_MUTED },

  divider: { height: 0.75, backgroundColor: COLOR_DIVIDER, marginVertical: 24 },

  twoColRow: { flexDirection: "row", gap: 18 },
  col: { flex: 1, flexDirection: "column", gap: 3 },
  fieldLabel: {
    fontSize: 8.25,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: COLOR_TEXT_FAINT,
    fontWeight: 600,
  },
  fieldValue: { fontSize: 11.25, fontWeight: 600 },
  fieldSub: { fontSize: 9.75, color: COLOR_TEXT_SECONDARY },

  descriptionBox: {
    marginTop: 12,
    fontSize: 9.75,
    color: COLOR_TEXT_BODY,
    lineHeight: 1.6,
    backgroundColor: COLOR_BOX_BG,
    borderRadius: 3,
    paddingVertical: 10.5,
    paddingHorizontal: 12,
  },

  table: { marginTop: 24 },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1.5,
    borderBottomColor: COLOR_TEXT,
    paddingBottom: 7.5,
  },
  tableHeaderCell: {
    fontSize: 8.25,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    color: COLOR_TEXT_SECONDARY,
    fontWeight: 600,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.75,
    borderBottomColor: COLOR_DIVIDER,
    paddingVertical: 9,
    alignItems: "center",
  },
  colName: { flex: 1 },
  colHours: { width: 67.5, textAlign: "right" },
  colRate: { width: 90, textAlign: "right" },
  colSubtotal: { width: 90, textAlign: "right" },
  itemName: { fontSize: 10.5, fontWeight: 500 },
  itemNote: { fontSize: 9, color: COLOR_TEXT_MUTED, marginTop: 1.5 },
  mono: { fontFamily: FONT_MONO, fontSize: 9.75 },
  monoStrong: { fontFamily: FONT_MONO, fontSize: 9.75, fontWeight: 600 },

  totalsBox: { marginTop: 15, alignSelf: "flex-end", width: 195, gap: 6 },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 9.75,
    color: COLOR_TEXT_SECONDARY,
  },
  totalsRule: { height: 0.75, backgroundColor: COLOR_TEXT, marginVertical: 3 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  totalLabel: {
    fontSize: 9.75,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  totalValue: { fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 700, color: ACCENT },
  currencyLabel: { textAlign: "right", fontSize: 8.25, color: COLOR_TEXT_FAINT },

  termsRow: { flexDirection: "row", gap: 15 },
  termCol: { flex: 1 },
  termLabel: {
    fontSize: 8.25,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: COLOR_TEXT_FAINT,
    fontWeight: 600,
    marginBottom: 4.5,
  },
  termValue: { fontSize: 9.375, color: COLOR_TEXT_BODY, lineHeight: 1.6 },

  footer: {
    marginTop: 24,
    paddingTop: 15,
    borderTopWidth: 0.75,
    borderTopColor: COLOR_DIVIDER,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: { fontSize: 9, color: COLOR_TEXT_MUTED },
  footerTag: { fontFamily: FONT_MONO, fontSize: 9, color: COLOR_TEXT_MUTED },
});

function toUrl(value: string): string {
  return /^https?:\/\//.test(value) ? value : `https://${value}`;
}

interface QuoteDocumentProps {
  quote: QuoteFormValues;
  freelancer: FreelancerProfile;
  quoteNumber: string;
  date: Date;
}

/**
 * Documento PDF de la cotización — replica el diseño de referencia en
 * `Template/Main.dc.html` (encabezado, cliente/proyecto, tabla de ítems,
 * totales y condiciones).
 */
export function QuoteDocument({
  quote,
  freelancer,
  quoteNumber,
  date,
}: QuoteDocumentProps) {
  const complexityMultiplierPercent = sumComplexityMultipliers(
    quote.complexityMultiplierIds,
  );
  const selectedMultipliers = COMPLEXITY_MULTIPLIERS.filter((multiplier) =>
    quote.complexityMultiplierIds.includes(multiplier.id),
  );
  const result = calculateQuote({
    items: quote.items,
    hourlyRate: quote.hourlyRate,
    complexityMultiplierPercent,
    additionalCharges: quote.additionalCharges,
    discountPercent: quote.discountPercent,
  });
  const validUntil = addDays(date, QUOTE_VALIDITY_DAYS);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.accentBar} fixed />

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.brandName}>{freelancer.name}</Text>
              {freelancer.tagline && (
                <Text style={styles.tagline}>{freelancer.tagline}</Text>
              )}
              <Text style={styles.contactLine}>
                {freelancer.email && (
                  <Link src={`mailto:${freelancer.email}`} style={styles.link}>
                    {freelancer.email}
                  </Link>
                )}
                {freelancer.email && freelancer.portfolio && "  ·  "}
                {freelancer.portfolio && (
                  <Link src={toUrl(freelancer.portfolio)} style={styles.link}>
                    {freelancer.portfolio}
                  </Link>
                )}
              </Text>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.title}>COTIZACIÓN</Text>
              <Text style={styles.metaMono}>N.º {quoteNumber}</Text>
              <Text style={styles.metaMono}>Fecha: {formatDateDMY(date)}</Text>
              <Text style={styles.metaMono}>
                Válida hasta: {formatDateDMY(validUntil)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.twoColRow}>
            <View style={styles.col}>
              <Text style={styles.fieldLabel}>Cliente</Text>
              <Text style={styles.fieldValue}>{quote.clientName}</Text>
              {quote.clientContact && (
                <Text style={styles.fieldSub}>{quote.clientContact}</Text>
              )}
            </View>
            <View style={styles.col}>
              <Text style={styles.fieldLabel}>Proyecto</Text>
              <Text style={styles.fieldValue}>{quote.projectName}</Text>
              <Text style={styles.fieldSub}>Tipo: {quote.projectType}</Text>
            </View>
          </View>

          {quote.description && (
            <Text style={styles.descriptionBox}>{quote.description}</Text>
          )}

          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeaderCell, styles.colName]}>
                Funcionalidad / módulo
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colHours]}>Horas</Text>
              <Text style={[styles.tableHeaderCell, styles.colRate]}>
                Tarifa/h
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colSubtotal]}>
                Subtotal
              </Text>
            </View>

            {quote.items.map((item, index) => (
              <View style={styles.tableRow} key={index} wrap={false}>
                <View style={styles.colName}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.complexity !== "Personalizado" && (
                    <Text style={styles.itemNote}>
                      Complejidad: {item.complexity}
                    </Text>
                  )}
                </View>
                <Text style={[styles.mono, styles.colHours]}>{item.hours}</Text>
                <Text style={[styles.mono, styles.colRate]}>
                  {formatCurrency(quote.hourlyRate, quote.currency)}
                </Text>
                <Text style={[styles.monoStrong, styles.colSubtotal]}>
                  {formatCurrency(item.hours * quote.hourlyRate, quote.currency)}
                </Text>
              </View>
            ))}
          </View>

          {selectedMultipliers.length > 0 && (
            <Text style={styles.itemNote}>
              Incluye:{" "}
              {selectedMultipliers
                .map((m) => `${m.label} (+${m.percent}%)`)
                .join(", ")}
            </Text>
          )}

          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text>Subtotal mano de obra</Text>
              <Text style={styles.mono}>
                {formatCurrency(result.laborSubtotal, quote.currency)}
              </Text>
            </View>
            {complexityMultiplierPercent > 0 && (
              <View style={styles.totalsRow}>
                <Text>Complejidad (+{complexityMultiplierPercent}%)</Text>
                <Text style={styles.mono}>
                  {formatCurrency(result.complexityAmount, quote.currency)}
                </Text>
              </View>
            )}
            <View style={styles.totalsRow}>
              <Text>Cargos adicionales</Text>
              <Text style={styles.mono}>
                {formatCurrency(result.additionalChargesTotal, quote.currency)}
              </Text>
            </View>
            <View style={styles.totalsRow}>
              <Text>Subtotal</Text>
              <Text style={styles.mono}>
                {formatCurrency(result.subtotal, quote.currency)}
              </Text>
            </View>
            <View style={styles.totalsRow}>
              <Text>Descuento</Text>
              <Text style={styles.mono}>
                − {formatCurrency(result.discountAmount, quote.currency)}
              </Text>
            </View>
            <View style={styles.totalsRule} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(result.total, quote.currency)}
              </Text>
            </View>
            <Text style={styles.currencyLabel}>{quote.currency}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.termsRow}>
            <View style={styles.termCol}>
              <Text style={styles.termLabel}>Forma de pago</Text>
              <Text style={styles.termValue}>{quote.paymentTerms}</Text>
            </View>
            <View style={styles.termCol}>
              <Text style={styles.termLabel}>Tiempo estimado</Text>
              <Text style={styles.termValue}>{quote.estimatedDelivery}</Text>
            </View>
            <View style={styles.termCol}>
              <Text style={styles.termLabel}>Vigencia</Text>
              <Text style={styles.termValue}>
                Esta cotización es válida por {QUOTE_VALIDITY_DAYS} días desde su
                fecha de emisión.
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Gracias por la oportunidad de cotizar este proyecto.
            </Text>
            <Text style={styles.footerTag}>
              {freelancer.handle && `${freelancer.handle} · `}
              {freelancer.portfolio}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
