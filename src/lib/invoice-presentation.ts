import type {CalculationResult, InvoiceRecord} from "@/domain/invoice/types";
import {lineAmountMinor, invoiceLabel, paymentTotalMinor} from "./invoice-display";
import {money} from "./format";

export const invoiceVisuals = {
  ink: "#13222a",
  muted: "#68808a",
  line: "#d8e1e3",
  pagePadding: 34,
  headerGap: 24,
  tableGap: 30,
  totalsWidth: 220,
} as const;

export type InvoicePresentation = ReturnType<typeof createInvoicePresentation>;

export function createInvoicePresentation(invoice: InvoiceRecord, result: CalculationResult) {
  const label = (value: string) => invoiceLabel(invoice, value);
  const formatMoney = (value: number) => money(value, invoice.currency);
  return {
    businessName: invoice.business.name || "YOUR BUSINESS",
    invoiceNumber: invoice.invoiceNumber,
    amountDueLabel: label("Amount due").toUpperCase(),
    amountDue: formatMoney(result.amountDueMinor),
    billToLabel: label("Bill to"),
    clientName: invoice.client.name || invoice.client.company || "Your client",
    clientEmail: invoice.client.email,
    issueDateLabel: label("Issue date"),
    issueDate: invoice.issueDate,
    dueLabel: label("Due"),
    dueDate: invoice.dueDate,
    columns: {description: label("Description"), quantity: label("Qty"), amount: "Amount"},
    items: invoice.items.map((item) => ({
      id: item.id,
      description: item.description || "Item",
      quantity: item.quantity,
      amount: formatMoney(lineAmountMinor(item.quantity, item.unitPriceMinor)),
    })),
    totals: [
      {label: label("Subtotal"), value: formatMoney(result.netSubtotalMinor)},
      {label: label("Tax"), value: formatMoney(result.taxMinor)},
      {label: label("Shipping"), value: formatMoney(result.shippingMinor)},
      {label: label("Total"), value: formatMoney(result.grandTotalMinor), emphasis: true},
      {label: "Paid / deposit", value: `-${formatMoney(paymentTotalMinor(result))}`},
      {label: label("Amount due"), value: formatMoney(result.amountDueMinor), emphasis: true},
    ],
    thankYouMessage: invoice.notes.thankYouMessage,
    terms: invoice.notes.terms,
    pageSize: invoice.appearance.pageSize,
  };
}
