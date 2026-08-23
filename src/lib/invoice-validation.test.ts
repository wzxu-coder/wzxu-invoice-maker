import {describe,expect,it} from "vitest";
import {createInvoice} from "../domain/invoice/defaults";
import {validateInvoiceForFinalization} from "./invoice-validation";

describe("validateInvoiceForFinalization",()=>{
  it("rejects incomplete drafts",()=>{
    expect(validateInvoiceForFinalization(createInvoice())).toEqual(expect.arrayContaining(["Add your business name.","Add a client name or company.","Add at least one line with a description, quantity, and positive price."]));
  });
  it("accepts a complete invoice",()=>{
    const invoice=createInvoice("INV-TEST-0001");
    invoice.business.name="WZXU Studio";
    invoice.client.name="Example Client";
    invoice.items[0].description="Design services";
    invoice.items[0].unitPriceMinor=100;
    expect(validateInvoiceForFinalization(invoice)).toEqual([]);
  });
  it("rejects a due date before the issue date",()=>{
    const invoice=createInvoice();
    invoice.business.name="WZXU Studio";
    invoice.client.name="Example Client";
    invoice.items[0].description="Design services";
    invoice.items[0].unitPriceMinor=100;
    invoice.dueDate="2020-01-01";
    expect(validateInvoiceForFinalization(invoice)).toContain("Due date cannot be before the issue date.");
  });
});
