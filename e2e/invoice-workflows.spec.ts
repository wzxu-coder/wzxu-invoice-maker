import {expect,test} from "playwright/test";
import type {Page} from "playwright";
import fs from "node:fs/promises";

async function clearLocalData(page:Page){
  await page.goto("/");
  await page.evaluate(async()=>{for(const name of await indexedDB.databases())if(name.name)indexedDB.deleteDatabase(name.name)});
}

async function populateInvoice(page:Page){
  const inputs=page.locator("input");
  await inputs.nth(0).fill("INV-E2E-0001");
  await inputs.nth(4).fill("WZXU Test Studio");
  await inputs.nth(6).fill("Example Client");
  await inputs.nth(9).fill("Design services");
  await inputs.nth(11).fill("125");
}

test.beforeEach(async({page})=>{await clearLocalData(page)});

test("public routes render without runtime errors or invoice payloads",async({page})=>{
  const errors:string[]=[];
  const requests:string[]=[];
  page.on("pageerror",error=>errors.push(error.message));
  page.on("request",request=>{if(/INV-E2E|Example%20Client|Example Client/.test(request.url()))requests.push(request.url())});
  for(const route of ["/","/create","/history","/help","/privacy","/terms"]){await page.goto(route);await expect(page.locator("body")).toBeVisible()}
  expect(errors).toEqual([]);
  expect(requests).toEqual([]);
});

test("finalizes an invoice and persists issued status",async({page})=>{
  await page.goto("/create");
  await populateInvoice(page);
  await page.getByRole("button",{name:"Finalize invoice"}).click();
  await expect(page.locator(".status")).toHaveText("Issued");
  await page.goto("/history");
  const invoiceHref=await page.locator("a[href^='/create/']").first().getAttribute("href");
  await page.goto(invoiceHref!);
  await expect(page.getByRole("heading",{name:"Edit invoice"})).toBeVisible();
  await page.reload();
  await expect(page.locator(".status")).toHaveText("Issued");
});

test("blocks outward actions on drafts",async({page})=>{
  await page.goto("/create");
  await page.getByRole("button",{name:"Download PDF"}).click();
  await expect(page.locator(".action-error")).toContainText("Finalize this invoice");
  await page.getByRole("button",{name:"Email invoice"}).click();
  await expect(page.locator(".action-error")).toContainText("Finalize this invoice");
});

test("downloads a finalized PDF with a safe filename",async({page})=>{
  await page.goto("/create");
  await populateInvoice(page);
  await page.getByRole("button",{name:"Finalize invoice"}).click();
  const downloadPromise=page.waitForEvent("download");
  await page.getByRole("button",{name:"Download PDF"}).click();
  const download=await downloadPromise;
  expect(download.suggestedFilename()).toBe("INV-E2E-0001.pdf");
  const file=await download.path();
  expect(file).toBeTruthy();
  const stat=await fs.stat(file!);
  expect(stat.size).toBeGreaterThan(0);
});

test("deletes and preserves invoices from History",async({page})=>{
  await page.goto("/create");
  await populateInvoice(page);
  await page.getByRole("button",{name:"Save draft"}).click();
  await page.goto("/history");
  await expect(page.getByText("INV-E2E-0001",{exact:true})).toBeVisible();
  page.once("dialog",dialog=>dialog.dismiss());
  await page.getByRole("button",{name:"Delete INV-E2E-0001"}).click();
  await expect(page.getByText("INV-E2E-0001",{exact:true})).toBeVisible();
  page.once("dialog",dialog=>dialog.accept());
  await page.getByRole("button",{name:"Delete INV-E2E-0001"}).click();
  await expect(page.getByText("No saved invoices yet",{exact:true})).toBeVisible();
});

test("keeps the editor usable on mobile with a long invoice",async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto("/create");
  for(let i=0;i<40;i++)await page.getByRole("button",{name:"Add item",exact:true}).click();
  await expect(page.getByRole("button",{name:"Finalize invoice"})).toBeVisible();
  await expect(page.locator("table tbody tr")).toHaveCount(41);
});

test("provides accessible mobile navigation for History and Help",async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto("/");
  const menu=page.getByRole("button",{name:"Menu"});
  await expect(menu).toBeVisible();
  await expect(menu).toHaveAttribute("aria-expanded","false");
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded","true");
  await expect(page.getByRole("menuitem",{name:"History"})).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menuitem",{name:"History"})).toBeHidden();
  await menu.click();
  await page.getByRole("menuitem",{name:"History"}).click();
  await expect(page).toHaveURL(/\/history$/);
  await page.goto("/");
  await menu.click();
  await page.getByRole("menuitem",{name:"Help"}).click();
  await expect(page).toHaveURL(/\/help$/);
});

test("keeps desktop secondary navigation visible without the mobile menu",async({page})=>{
  await page.setViewportSize({width:1280,height:800});
  await page.goto("/");
  await expect(page.getByRole("link",{name:"History"})).toBeVisible();
  await expect(page.getByRole("link",{name:"Help"})).toBeVisible();
  await expect(page.getByRole("button",{name:"Menu"})).toBeHidden();
});

test("publishes install icon metadata without invoice data",async({page,request})=>{
  const manifest=await request.get("/manifest.webmanifest");
  expect(manifest.ok()).toBeTruthy();
  const data=await manifest.json();
  expect(data.icons).toEqual(expect.arrayContaining([
    expect.objectContaining({src:"/brand/icons/wzxu-invoice-icon-192.png",sizes:"192x192"}),
    expect.objectContaining({src:"/brand/icons/wzxu-invoice-icon-512.png",sizes:"512x512"})
  ]));
  await page.goto("/");
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute("href",/favicon\.png$/);
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute("href",/wzxu-invoice-icon-180\.png$/);
});
