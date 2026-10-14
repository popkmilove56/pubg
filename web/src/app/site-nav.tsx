"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const FACEBOOK_URL = "https://www.facebook.com/Phetvaravut?locale=th_TH";
const DISCORD_URL = "https://discord.gg/rrJvHZfkw";

const links = [
  ["Home", "#home"],
  ["Live", "#live"],
  ["Tournaments", "#tournaments"],
  ["Teams", "#teams"],
  ["Work", "#work"],
  ["Contact", "#contact"],
];

function BrandMark() {
  return <Image className="brandMark" src="/media/gbg-battlegrounds-logo.png" alt="GBG Battlegrounds" width={64} height={64} priority />;
}

export function SiteNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, []);

  return <header className={`siteHeader ${open ? "menuOpen" : ""}`}>
    <div className="navInner">
      <a className="brand" href={FACEBOOK_URL} target="_blank" rel="noreferrer" aria-label="GBGBattelgrounds on Facebook">
        <BrandMark />
      </a>
      <nav className="desktopNav" aria-label="Main navigation">{links.map(([label, href]) => <a href={href} key={href}>{label}</a>)}</nav>
      <div className="navActions">
        <a className="navFacebook" href={FACEBOOK_URL} target="_blank" rel="noreferrer" aria-label="Open GBGBattelgrounds Facebook">f</a>
        <a className="button navCta" href={DISCORD_URL} target="_blank" rel="noreferrer">JOIN DISCORD</a>
        <button className="menuToggle" type="button" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen((value) => !value)}><span /><span /></button>
      </div>
    </div>
    <nav className="mobileNav" id="mobile-navigation" aria-label="Mobile navigation">{links.map(([label, href], index) => <a href={href} key={href} onClick={() => setOpen(false)}><small>0{index + 1}</small><span>{label}</span></a>)}<a className="mobileFacebook" href={FACEBOOK_URL} target="_blank" rel="noreferrer">FACEBOOK ↗</a></nav>
  </header>;
}
