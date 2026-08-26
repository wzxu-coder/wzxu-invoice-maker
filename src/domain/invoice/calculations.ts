import type { InvoiceRecord, CalculationResult } from "./types";
const minor = (n:number) => Math.round(n);
const qty = (s:string) => Number.parseFloat(s.replace(",",".")) || 0;
export function calculateInvoice(invoice: InvoiceRecord): CalculationResult {
  const safeNumber=(value: number | undefined): number => typeof value === "number" && Number.isFinite(value) ? value : 0;
  const lines = invoice.items.map(item => { const base=minor(qty(item.quantity)*safeNumber(item.unitPriceMinor)); const discount=minor(base*Math.min(10000,Math.max(0,safeNumber(item.discountBasisPoints)))/10000); return {id:item.id,baseMinor:base,discountMinor:discount,netMinor:base-discount,taxableMinor:item.taxable?base-discount:0}; });
  const gross=lines.reduce((s,l)=>s+l.baseMinor,0), lineDiscount=lines.reduce((s,l)=>s+l.discountMinor,0), net=lines.reduce((s,l)=>s+l.netMinor,0);
  const a=invoice.adjustments; const requested=a.discountType==="fixed"?safeNumber(a.discountMinor):a.discountType==="percentage"?minor(net*Math.min(10000,Math.max(0,safeNumber(a.discountBasisPoints)))/10000):0; const invoiceDiscount=Math.min(net,Math.max(0,requested));
  const taxableLines=lines.reduce((s,l)=>s+l.taxableMinor,0);
  const taxableBase=Math.max(0, taxableLines-minor(invoiceDiscount*(taxableLines/Math.max(1,net)))+(a.shippingTaxable?Math.max(0,safeNumber(a.shippingMinor)):0)+(a.additionalFeeTaxable?Math.max(0,safeNumber(a.additionalFeeMinor)):0));
  const tax=minor(taxableBase*Math.max(0,safeNumber(a.taxBasisPoints))/10000); const shipping=Math.max(0,safeNumber(a.shippingMinor)), fee=Math.max(0,safeNumber(a.additionalFeeMinor)), credit=Math.max(0,safeNumber(a.creditMinor)); const total=Math.max(0,net-invoiceDiscount+tax+shipping+fee-credit); const due=total-Math.max(0,safeNumber(a.depositMinor))-Math.max(0,safeNumber(a.amountPaidMinor));
  return {lines,grossSubtotalMinor:gross,lineDiscountMinor:lineDiscount,netSubtotalMinor:net,invoiceDiscountMinor:invoiceDiscount,taxableSubtotalMinor:taxableBase,taxMinor:tax,shippingMinor:shipping,feeMinor:fee,creditMinor:credit,grandTotalMinor:total,depositMinor:Math.max(0,safeNumber(a.depositMinor)),amountPaidMinor:Math.max(0,safeNumber(a.amountPaidMinor)),amountDueMinor:due,warnings: requested>net?["Invoice discount capped at the net subtotal."]:[]};
}
