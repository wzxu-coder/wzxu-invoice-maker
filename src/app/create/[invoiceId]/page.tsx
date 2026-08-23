import Editor from "@/components/Editor"; export default async function Edit({params}:{params:Promise<{invoiceId:string}>}){const {invoiceId}=await params;return <Editor invoiceId={invoiceId}/>}
