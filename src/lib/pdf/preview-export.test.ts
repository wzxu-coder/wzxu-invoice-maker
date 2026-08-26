import {describe,expect,it} from "vitest";
import {fitPreviewToPage,pdfPagePoints} from "./preview-export";

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
