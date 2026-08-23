import Dexie, { type Table } from "dexie"; import type { InvoiceRecord } from "@/domain/invoice/types";
class InvoiceDB extends Dexie { invoices!:Table<InvoiceRecord,string>; constructor(){super("wzxu-invoice-maker");this.version(1).stores({invoices:"id,updatedAt,invoiceNumber,status"});} }
export const db=typeof window!=="undefined"?new InvoiceDB():null;
export async function saveInvoice(invoice:InvoiceRecord){if(db) await db.invoices.put(invoice)}
export async function getInvoices(){return db?db.invoices.orderBy("updatedAt").reverse().toArray():[]}
export async function getInvoice(id:string){return db?db.invoices.get(id):undefined}
export async function deleteInvoice(id:string){if(db) await db.invoices.delete(id)}
