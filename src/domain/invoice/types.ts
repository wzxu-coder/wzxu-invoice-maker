export type SupportedCurrency = "USD"|"MXN"|"CAD"|"EUR"|"GBP"|"AUD"|"JPY"|"BRL";
export type InvoiceStatus = "draft"|"issued"|"paid"|"void";
export type InvoiceTemplateId = "clean-professional"|"midnight-creator";
export interface Address { line1:string; line2:string; city:string; region:string; postalCode:string; country:string }
export interface Business { name:string; contactName:string; email:string; phone:string; website:string; taxId:string; address:Address }
export interface Client { name:string; company:string; email:string; phone:string; taxId:string; reference:string; address:Address }
export interface InvoiceItem { id:string; description:string; category:string; quantity:string; unitLabel:string; unitPriceMinor:number; discountBasisPoints:number; taxable:boolean; sortOrder:number }
export interface Adjustments { discountType:"none"|"fixed"|"percentage"; discountMinor:number; discountBasisPoints:number; taxLabel:string; taxBasisPoints:number; shippingMinor:number; shippingTaxable:boolean; additionalFeeLabel:string; additionalFeeMinor:number; additionalFeeTaxable:boolean; creditMinor:number; depositMinor:number; amountPaidMinor:number }
export type PaymentMethodType = "paypal"|"zelle"|"custom";
export interface PaymentMethod { id:string; type:PaymentMethodType; label:string; value:string; instructions?:string }
export interface Notes { notesToClient:string; terms:string; lateFeeTerms:string; thankYouMessage:string; signatureName:string; signatureTitle:string }
export interface InvoiceRecord { id:string; schemaVersion:number; createdAt:string; updatedAt:string; status:InvoiceStatus; business:Business; client:Client; invoiceNumber:string; issueDate:string; dueDate:string; purchaseOrderNumber:string; projectName:string; currency:SupportedCurrency; items:InvoiceItem[]; adjustments:Adjustments; paymentMethods:PaymentMethod[]; notes:Notes; appearance:{templateId:InvoiceTemplateId; accentColor:string; pageSize:"LETTER"|"A4"; invoiceLocale:"en-US"|"es-MX"} }
export interface CalculationResult { lines:{id:string;baseMinor:number;discountMinor:number;netMinor:number;taxableMinor:number}[]; grossSubtotalMinor:number; lineDiscountMinor:number; netSubtotalMinor:number; invoiceDiscountMinor:number; taxableSubtotalMinor:number; taxMinor:number; shippingMinor:number; feeMinor:number; creditMinor:number; grandTotalMinor:number; depositMinor:number; amountPaidMinor:number; amountDueMinor:number; warnings:string[] }
