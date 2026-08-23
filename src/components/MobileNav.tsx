"use client";

import Link from "next/link";
import {useEffect, useRef, useState} from "react";

export default function MobileNav(){
  const [open,setOpen]=useState(false);
  const ref=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    if(!open)return;
    const onKeyDown=(event:KeyboardEvent)=>{if(event.key==="Escape")setOpen(false)};
    const onPointerDown=(event:PointerEvent)=>{if(ref.current&&!ref.current.contains(event.target as Node))setOpen(false)};
    document.addEventListener("keydown",onKeyDown);
    document.addEventListener("pointerdown",onPointerDown);
    return()=>{document.removeEventListener("keydown",onKeyDown);document.removeEventListener("pointerdown",onPointerDown)};
  },[open]);

  return <div className="mobile-nav" ref={ref}>
    <button className="mobile-menu-button" type="button" aria-expanded={open} aria-controls="mobile-navigation" onClick={()=>setOpen(value=>!value)}>
      <span className="mobile-menu-icon" aria-hidden="true"><span/><span/><span/></span><span>Menu</span>
    </button>
    {open&&<div className="mobile-menu" id="mobile-navigation" role="menu"><Link href="/history" role="menuitem" onClick={()=>setOpen(false)}>History</Link><Link href="/help" role="menuitem" onClick={()=>setOpen(false)}>Help</Link></div>}
  </div>;
}
