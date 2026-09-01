import {describe,expect,it} from "vitest";
import {createDemoInvoices} from "./demo";
import {calculateInvoice} from "./calculations";

describe("promotional demo invoices",()=>{
  it("creates five unique, fully populated invoices",()=>{
    const invoices=createDemoInvoices();
    expect(invoices).toHaveLength(5);
    expect(new Set(invoices.map(x=>x.id)).size).toBe(5);
    expect(new Set(invoices.map(x=>x.invoiceNumber)).size).toBe(5);
    for(const invoice of invoices){
      expect(invoice.business.name).toBeTruthy(); expect(invoice.business.address.line1).toBeTruthy();
      expect(invoice.client.company).toBeTruthy(); expect(invoice.client.address.city).toBeTruthy();
      expect(invoice.items.length).toBeGreaterThanOrEqual(2); expect(invoice.paymentMethods.length).toBeGreaterThan(0);
      expect(invoice.notes.terms).toBe(""); expect(invoice.notes.signatureName).toBeTruthy();
      expect(["USD","MXN","CAD","EUR","GBP","AUD","JPY","BRL"]).toContain(invoice.currency);
      const result=calculateInvoice(invoice); expect(result.grandTotalMinor).toBeGreaterThanOrEqual(0); expect(result.amountDueMinor).toBeLessThanOrEqual(result.grandTotalMinor);
    }
  });
});
