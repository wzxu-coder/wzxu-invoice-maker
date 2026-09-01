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

export type PrintPageSlice={start:number;end:number};
export const printPageLabel=(page:number,total:number)=>`Page ${page} of ${total}`;

export function paginatePreview(sourceHeight:number,pageHeight:number,keepTogether:Array<{start:number;end:number}>=[],safeBreaks:number[]=[]):PrintPageSlice[]{
  if(sourceHeight<=0||pageHeight<=0)return [];
  const pages:PrintPageSlice[]=[];
  const breaks=[...safeBreaks].filter(point=>point>0&&point<sourceHeight).sort((a,b)=>a-b);
  let start=0;
  while(start<sourceHeight){
    const target=Math.min(start+pageHeight,sourceHeight);
    if(target===sourceHeight){pages.push({start,end:target});break}
    const protectedBlock=keepTogether.find(block=>block.start>start&&block.start<target&&block.end>target);
    let end=protectedBlock?.start??target;
    const safe=breaks.filter(point=>point>start+pageHeight*.5&&point<=end).at(-1);
    if(safe)end=safe;
    if(end<=start)end=target;
    pages.push({start,end});
    start=end;
  }
  return pages;
}

export async function downloadPreviewPdf(element:HTMLElement, invoice:InvoiceRecord){
  const documentPdf=await createPreviewPdf(element,invoice);
  documentPdf.save(pdfFilename(invoice));
}

export async function createPreviewPdf(element:HTMLElement, invoice:InvoiceRecord){
  await document.fonts?.ready;
  const canvas=await html2canvas(element,{backgroundColor:"#ffffff",scale:2,useCORS:true,logging:false});
  const page=pdfPagePoints[invoice.appearance.pageSize];
  const placement=fitPreviewToPage(canvas.width,canvas.height,invoice.appearance.pageSize);
  const documentPdf=new jsPDF({orientation:"portrait",unit:"pt",format:[page.width,page.height],compress:true});
  documentPdf.addImage(canvas.toDataURL("image/png"),"PNG",placement.x,placement.y,placement.width,placement.height,undefined,"FAST");
  return documentPdf;
}

export async function createPrintPdf(element:HTMLElement,invoice:InvoiceRecord){
  await document.fonts?.ready;
  const canvas=await html2canvas(element,{backgroundColor:"#ffffff",scale:2,useCORS:true,logging:false});
  const page=pdfPagePoints[invoice.appearance.pageSize];
  const margin=24;
  const footerHeight=24;
  const renderedWidth=page.width-margin*2;
  const pointsPerPixel=renderedWidth/canvas.width;
  const sourcePageHeight=(page.height-margin*2-footerHeight)/pointsPerPixel;
  const elementRect=element.getBoundingClientRect();
  const pixelsPerCssPixel=canvas.height/elementRect.height;
  const position=(node:Element)=>{const rect=node.getBoundingClientRect();return {start:(rect.top-elementRect.top)*pixelsPerCssPixel,end:(rect.bottom-elementRect.top)*pixelsPerCssPixel}};
  const rows=Array.from(element.querySelectorAll("tbody tr")).map(position);
  const keepTogether=Array.from(element.querySelectorAll(".preview-top,.totals,p")).map(position);
  const slices=paginatePreview(canvas.height,sourcePageHeight,keepTogether,rows.map(row=>row.end));
  const documentPdf=new jsPDF({orientation:"portrait",unit:"pt",format:[page.width,page.height],compress:true});
  slices.forEach((slice,index)=>{
    if(index)documentPdf.addPage([page.width,page.height],"portrait");
    const sliceHeight=Math.max(1,Math.ceil(slice.end-slice.start));
    const sliceCanvas=document.createElement("canvas");
    sliceCanvas.width=canvas.width;
    sliceCanvas.height=sliceHeight;
    const context=sliceCanvas.getContext("2d");
    if(!context)throw new Error("Unable to prepare invoice page");
    context.fillStyle="#ffffff";
    context.fillRect(0,0,sliceCanvas.width,sliceCanvas.height);
    context.drawImage(canvas,0,slice.start,canvas.width,sliceHeight,0,0,canvas.width,sliceHeight);
    documentPdf.addImage(sliceCanvas.toDataURL("image/png"),"PNG",margin,margin,renderedWidth,sliceHeight*pointsPerPixel,undefined,"FAST");
    documentPdf.setFillColor(255,255,255);
    documentPdf.rect(0,page.height-margin-footerHeight,page.width,margin+footerHeight,"F");
    documentPdf.setFont("helvetica","normal");
    documentPdf.setFontSize(8);
    documentPdf.setTextColor(104,128,138);
    documentPdf.text(printPageLabel(index+1,slices.length),page.width/2,page.height-margin,{align:"center"});
  });
  return documentPdf;
}

export async function openPrintPreviewPdf(element:HTMLElement,invoice:InvoiceRecord,printWindow:Window){
  const documentPdf=await createPrintPdf(element,invoice);
  const url=URL.createObjectURL(documentPdf.output("blob"));
  try{printWindow.location.replace(url)}catch(error){URL.revokeObjectURL(url);throw error}
  const cleanup=window.setInterval(()=>{if(printWindow.closed){window.clearInterval(cleanup);URL.revokeObjectURL(url)}},1000);
}

export async function sharePreviewPdf(element:HTMLElement, invoice:InvoiceRecord){
  if(!navigator.share) return false;
  const documentPdf=await createPreviewPdf(element,invoice);
  const blob=documentPdf.output("blob");
  const file=new File([blob],pdfFilename(invoice),{type:"application/pdf"});
  if(navigator.canShare && !navigator.canShare({files:[file]})) return false;
  await navigator.share({title:`Invoice ${invoice.invoiceNumber}`,text:`Invoice ${invoice.invoiceNumber} from ${invoice.business.name||"your business"}`,files:[file]});
  return true;
}
