import type {InvoiceRecord,CalculationResult} from "@/domain/invoice/types";
export function lineAmountMinor(quantity:string,unitPriceMinor:number){return Math.round((Number(quantity)||0)*unitPriceMinor)}
export function invoiceLabel(invoice:InvoiceRecord,label:string){return invoice.appearance.invoiceLocale==="es-MX"?({"Amount due":"Importe pendiente","Bill to":"Facturar a","Issue date":"Fecha de emisión","Due":"Vence","Description":"Descripción","Qty":"Cant.","Subtotal":"Subtotal","Tax":"Impuesto","Shipping":"Envío","Total":"Total"}[label]||label):label}
export function paymentTotalMinor(result:CalculationResult){return result.depositMinor+result.amountPaidMinor}
