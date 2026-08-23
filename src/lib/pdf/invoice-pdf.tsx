import {Document,Image,Page,Text,View,StyleSheet} from "@react-pdf/renderer";
import type {InvoiceRecord,CalculationResult} from "@/domain/invoice/types";
import {lineAmountMinor,paymentTotalMinor,invoiceLabel} from "@/lib/invoice-display";

const styles=StyleSheet.create({
  page:{padding:34,fontSize:10,color:"#13222a",fontFamily:"Helvetica"},
  header:{flexDirection:"row",justifyContent:"space-between",borderBottom:2,borderColor:"#13222a",paddingBottom:20},
  brandMark:{width:36,height:36,marginBottom:6},
  title:{fontSize:26,fontWeight:700},
  muted:{color:"#68808a",fontSize:9},
  section:{marginTop:24},
  info:{flexDirection:"row",justifyContent:"space-between",fontSize:10},
  tableHeader:{flexDirection:"row",justifyContent:"space-between",paddingVertical:10,borderBottom:1,borderColor:"#13222a",fontWeight:700},
  row:{flexDirection:"row",justifyContent:"space-between",paddingVertical:9,borderBottom:1,borderColor:"#d8e1e3"},
  description:{width:"62%"},
  quantity:{width:"12%"},
  amount:{width:"26%",textAlign:"right"},
  total:{fontSize:13,fontWeight:700,borderTop:2,borderColor:"#13222a",paddingTop:9,marginTop:5},
  footer:{marginTop:42,color:"#68808a",fontSize:9}
});

const money=(minor:number,currency:string)=>new Intl.NumberFormat(currency==="MXN"?"es-MX":"en-US",{style:"currency",currency}).format(minor/100);

export function InvoicePdf({invoice,result}:{invoice:InvoiceRecord;result:CalculationResult}){
  return <Document><Page size={invoice.appearance.pageSize} style={styles.page} wrap>
    <View style={styles.header}><View><Image src="/brand/wzxu-invoice-mark.png" style={styles.brandMark}/><Text style={styles.muted}>{invoice.business.name||"YOUR BUSINESS"}</Text><Text style={styles.title}>INVOICE</Text><Text style={styles.muted}>{invoice.invoiceNumber}</Text></View><View><Text style={styles.muted}>{invoiceLabel(invoice,"Amount due").toUpperCase()}</Text><Text style={styles.title}>{money(result.amountDueMinor,invoice.currency)}</Text></View></View>
    <View style={[styles.section,styles.info]}><View><Text>{invoiceLabel(invoice,"Bill to")}</Text><Text>{invoice.client.name||invoice.client.company||"Your client"}</Text><Text style={styles.muted}>{invoice.client.email}</Text></View><View><Text>{invoiceLabel(invoice,"Issue date")}</Text><Text>{invoice.issueDate}</Text><Text>{invoiceLabel(invoice,"Due")} {invoice.dueDate}</Text></View></View>
    <View style={styles.section}><View style={styles.tableHeader}><Text style={styles.description}>{invoiceLabel(invoice,"Description")}</Text><Text style={styles.quantity}>{invoiceLabel(invoice,"Qty")}</Text><Text style={styles.amount}>Amount</Text></View>{invoice.items.map(item=><View style={styles.row} key={item.id} wrap={false}><Text style={styles.description}>{item.description||"Item"}</Text><Text style={styles.quantity}>{item.quantity}</Text><Text style={styles.amount}>{money(lineAmountMinor(item.quantity,item.unitPriceMinor),invoice.currency)}</Text></View>)}</View>
    <View style={styles.section} wrap={false}><View style={styles.row}><Text>{invoiceLabel(invoice,"Subtotal")}</Text><Text>{money(result.netSubtotalMinor,invoice.currency)}</Text></View><View style={styles.row}><Text>{invoiceLabel(invoice,"Tax")}</Text><Text>{money(result.taxMinor,invoice.currency)}</Text></View><View style={styles.row}><Text>{invoiceLabel(invoice,"Shipping")}</Text><Text>{money(result.shippingMinor,invoice.currency)}</Text></View><View style={[styles.row,styles.total]}><Text>{invoiceLabel(invoice,"Total")}</Text><Text>{money(result.grandTotalMinor,invoice.currency)}</Text></View><View style={styles.row}><Text>Paid / deposit</Text><Text>-{money(paymentTotalMinor(result),invoice.currency)}</Text></View><View style={[styles.row,styles.total]}><Text>{invoiceLabel(invoice,"Amount due")}</Text><Text>{money(result.amountDueMinor,invoice.currency)}</Text></View></View>
    <View style={styles.footer}><Text>{invoice.notes.thankYouMessage}</Text><Text>{invoice.notes.terms}</Text><Text>WZXU Invoice Maker · WZXU.pro</Text></View>
  </Page></Document>
}
