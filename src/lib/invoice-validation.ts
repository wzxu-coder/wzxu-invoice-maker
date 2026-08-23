import type {InvoiceRecord} from "@/domain/invoice/types";

export function validateInvoiceForFinalization(invoice:InvoiceRecord):string[]{
  const errors:string[]=[];
  if(!invoice.invoiceNumber.trim()) errors.push("Add an invoice number.");
  if(!invoice.business.name.trim()) errors.push("Add your business name.");
  if(!(invoice.client.name.trim()||invoice.client.company.trim())) errors.push("Add a client name or company.");
  const issue=Date.parse(`${invoice.issueDate}T00:00:00Z`);
  const due=Date.parse(`${invoice.dueDate}T00:00:00Z`);
  if(!invoice.issueDate||Number.isNaN(issue)) errors.push("Add a valid issue date.");
  if(!invoice.dueDate||Number.isNaN(due)) errors.push("Add a valid due date.");
  if(!Number.isNaN(issue)&&!Number.isNaN(due)&&due<issue) errors.push("Due date cannot be before the issue date.");
  if(!invoice.items.some(item=>item.description.trim()&&item.unitPriceMinor>0&&Number(item.quantity)>0)) errors.push("Add at least one line with a description, quantity, and positive price.");
  return errors;
}
