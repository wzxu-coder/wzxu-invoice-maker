import {describe,expect,it} from "vitest";
import {fitPreviewToPage,paginatePreview,pdfPagePoints,printPageLabel} from "./preview-export";

describe("fitPreviewToPage",()=>{
  it("fits and centers a Letter preview without distortion",()=>{
    const result=fitPreviewToPage(940,1292,"LETTER");
    expect(result.width/result.height).toBeCloseTo(940/1292,5);
    expect(result.x).toBeCloseTo((pdfPagePoints.LETTER.width-result.width)/2,5);
    expect(result.y).toBeCloseTo((pdfPagePoints.LETTER.height-result.height)/2,5);
    expect(result.width).toBeLessThanOrEqual(pdfPagePoints.LETTER.width-48);
    expect(result.height).toBeLessThanOrEqual(pdfPagePoints.LETTER.height-48);
  });

  it("uses A4 page geometry",()=>{
    const result=fitPreviewToPage(940,1292,"A4");
    expect(result.width).toBeLessThanOrEqual(pdfPagePoints.A4.width-48);
    expect(result.height).toBeLessThanOrEqual(pdfPagePoints.A4.height-48);
  });
});

describe("paginatePreview",()=>{
  it("keeps a one-page invoice on one page",()=>{
    expect(paginatePreview(700,800)).toEqual([{start:0,end:700}]);
  });

  it("orders two and three page slices without gaps",()=>{
    expect(paginatePreview(1600,800)).toEqual([{start:0,end:800},{start:800,end:1600}]);
    expect(paginatePreview(2100,800)).toEqual([{start:0,end:800},{start:800,end:1600},{start:1600,end:2100}]);
  });

  it("moves an indivisible totals block to the next page",()=>{
    expect(paginatePreview(1400,800,[{start:700,end:900}])).toEqual([{start:0,end:700},{start:700,end:1400}]);
  });

  it("uses row boundaries near a page break",()=>{
    expect(paginatePreview(1300,800,[],[300,620,940])).toEqual([{start:0,end:620},{start:620,end:1300}]);
  });

  it("uses only neutral page numbering in the print footer",()=>{
    const label=printPageLabel(2,3);
    expect(label).toBe("Page 2 of 3");
    expect(label).not.toMatch(/https?:|wzxu|\.pro/i);
  });
});
