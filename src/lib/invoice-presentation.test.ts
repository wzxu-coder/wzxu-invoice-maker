import {describe,expect,it} from "vitest";
import {createInvoice} from "../domain/invoice/defaults";
import {calculateInvoice} from "../domain/invoice/calculations";
import {createInvoicePresentation} from "./invoice-presentation";

describe("createInvoicePresentation",()=>{
  it("uses the calculation engine and shared display values",()=>{
    const invoice=createInvoice("INV-PRESENTATION");
    invoice.business.name="WZXU Studio";
    invoice.client.name="Example Client";
    invoice.items[0].description="Design services";
    invoice.items[0].quantity="2";
    invoice.items[0].unitPriceMinor=12500;
    invoice.adjustments.depositMinor=5000;
    const result=calculateInvoice(invoice);
    const view=createInvoicePresentation(invoice,result);
    expect(view.businessName).toBe("WZXU Studio");
    expect(view.items[0].amount).toBe("$250.00");
    expect(view.totals.map(x=>x.value)).toContain("$250.00");
    expect(view.totals[4].value).toBe("-$50.00");
    expect(view.amountDue).toBe("$200.00");
  });

  it("shares Spanish labels and MXN formatting with both renderers",()=>{
    const invoice=createInvoice();
    invoice.appearance.invoiceLocale="es-MX";
    invoice.currency="MXN";
    invoice.items[0].unitPriceMinor=12345;
    const view=createInvoicePresentation(invoice,calculateInvoice(invoice));
    expect(view.amountDueLabel).toBe("IMPORTE PENDIENTE");
    expect(view.billToLabel).toBe("Facturar a");
    expect(view.columns.description).toBe("Descripción");
    expect(view.items[0].amount).toContain("123.45");
  });
});
