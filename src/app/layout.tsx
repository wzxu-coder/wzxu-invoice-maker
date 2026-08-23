import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import type {ReactNode} from "react";

export const metadata={title:"WZXU Invoice Maker — Free Invoice Generator",description:"Create professional invoices without an account. Save drafts locally and download a clean PDF."};

export default function Layout({children}:{children:ReactNode}){
  return <html lang="en"><body><div className="shell"><nav className="nav"><Link href="/" className="brand"><Image src="/brand/wzxu-invoice-maker.png" alt="WZXU Invoice Maker" width={300} height={100} priority/></Link><div className="navlinks"><Link href="/history">History</Link><Link href="/templates">Templates</Link><Link href="/help">Help</Link></div><Link className="btn primary" href="/create">Create invoice</Link></nav>{children}<footer className="footer"><div className="container">WZXU Invoice Maker · Professional invoices without an account · Your data stays on this device.</div></footer></div></body></html>
}
