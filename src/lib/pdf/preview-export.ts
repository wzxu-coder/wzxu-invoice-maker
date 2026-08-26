import html2canvas from "html2canvas";
import {jsPDF} from "jspdf";
import type {InvoiceRecord} from "@/domain/invoice/types";
import {pdfFilename} from "../invoice-actions";

export const pdfPagePoints = {
  LETTER: {width: 612, height: 792},
  A4: {width: 595.28, height: 841.89},
} as const;

export function fitPreviewToPage(sourceWidth:number, sourceHeight:number, pageSize:InvoiceRecord["appearance"]["pageSize"], margin=24){
  const page=pdfPagePoints[pageSize];
  const scale=Math.min((page.width-margin*2)/sourceWidth,(page.height-margin*2)/sourceHeight);
  const width=sourceWidth*scale;
  const height=sourceHeight*scale;
  return {width,height,x:(page.width-width)/2,y:(page.height-height)/2,scale};
}

export async function downloadPreviewPdf(element:HTMLElement, invoice:InvoiceRecord){
  await document.fonts?.ready;
  const canvas=await html2canvas(element,{backgroundColor:"#ffffff",scale:2,useCORS:true,logging:false});
  const page=pdfPagePoints[invoice.appearance.pageSize];
  const placement=fitPreviewToPage(canvas.width,canvas.height,invoice.appearance.pageSize);
  const documentPdf=new jsPDF({orientation:"portrait",unit:"pt",format:[page.width,page.height],compress:true});
  documentPdf.addImage(canvas.toDataURL("image/png"),"PNG",placement.x,placement.y,placement.width,placement.height,undefined,"FAST");
  documentPdf.save(pdfFilename(invoice));
}
