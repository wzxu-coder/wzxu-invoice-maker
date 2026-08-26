import {Document,Page,Text,View,StyleSheet} from "@react-pdf/renderer";
import type {InvoiceRecord,CalculationResult} from "@/domain/invoice/types";
import {createInvoicePresentation,invoiceVisuals} from "@/lib/invoice-presentation";

const styles=StyleSheet.create({
  page:{padding:invoiceVisuals.pagePadding,fontSize:10,color:invoiceVisuals.ink,fontFamily:"Helvetica"},
  header:{flexDirection:"row",justifyContent:"space-between",borderBottom:2,borderColor:invoiceVisuals.ink,paddingBottom:22},
  title:{fontSize:26,fontWeight:700},
  muted:{color:invoiceVisuals.muted,fontSize:9},
  section:{marginTop:24},
  info:{flexDirection:"row",justifyContent:"space-between",fontSize:10},
  tableHeader:{flexDirection:"row",justifyContent:"space-between",paddingVertical:10,borderBottom:1,borderColor:invoiceVisuals.ink,fontWeight:700},
  row:{flexDirection:"row",justifyContent:"space-between",paddingVertical:9,borderBottom:1,borderColor:invoiceVisuals.line},
  description:{width:"62%"},
  quantity:{width:"12%"},
  amount:{width:"26%",textAlign:"right"},
  total:{fontSize:13,fontWeight:700,borderTop:2,borderColor:invoiceVisuals.ink,paddingTop:9,marginTop:5},
  footer:{marginTop:50,color:invoiceVisuals.muted,fontSize:9}
});

export function InvoicePdf({invoice,result}:{invoice:InvoiceRecord;result:CalculationResult}){
  const view = createInvoicePresentation(invoice,result);
  return <Document><Page size={view.pageSize} style={styles.page} wrap>
    <View style={styles.header}><View><Text style={styles.muted}>{view.businessName}</Text><Text style={styles.title}>INVOICE</Text><Text style={styles.muted}>{view.invoiceNumber}</Text></View><View><Text style={styles.muted}>{view.amountDueLabel}</Text><Text style={styles.title}>{view.amountDue}</Text></View></View>
    <View style={[styles.section,styles.info]}><View><Text>{view.billToLabel}</Text><Text>{view.clientName}</Text><Text style={styles.muted}>{view.clientEmail}</Text></View><View><Text>{view.issueDateLabel}</Text><Text>{view.issueDate}</Text><Text>{view.dueLabel} {view.dueDate}</Text></View></View>
    <View style={styles.section}><View style={styles.tableHeader}><Text style={styles.description}>{view.columns.description}</Text><Text style={styles.quantity}>{view.columns.quantity}</Text><Text style={styles.amount}>{view.columns.amount}</Text></View>{view.items.map(item=><View style={styles.row} key={item.id} wrap={false}><Text style={styles.description}>{item.description}</Text><Text style={styles.quantity}>{item.quantity}</Text><Text style={styles.amount}>{item.amount}</Text></View>)}</View>
    <View style={styles.section} wrap={false}>{view.totals.map((total,index)=><View key={`${total.label}-${index}`} style={total.emphasis?[styles.row,styles.total]:styles.row}><Text>{total.label}</Text><Text>{total.value}</Text></View>)}</View>
    <View style={styles.footer}><Text>{view.thankYouMessage}</Text>{view.terms?<Text>{view.terms}</Text>:null}</View>
  </Page></Document>
}
