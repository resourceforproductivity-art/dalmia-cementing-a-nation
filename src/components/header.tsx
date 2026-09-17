"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Arrow } from "./arrow";

const links = [
  { label: "About", target: "about", note: "The foundation of our story" },
  { label: "Businesses", target: "our-world", note: "Ideas that shape our world" },
  { label: "Sustainability", target: "sustainability", note: "A more considered tomorrow" },
];

export function Header() {
  const header = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const about = document.getElementById("about");
      const closing = document.getElementById("closing");
      const threshold = (header.current?.offsetHeight ?? 111) + 8;
      const light = about && closing && about.getBoundingClientRect().top <= threshold && closing.getBoundingClientRect().top > threshold;
      if (header.current) header.current.dataset.theme = light ? "light" : "dark";
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  const close = () => { dialog.current?.close(); setOpen(false); };
  const navigate = (event: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    event.preventDefault();
    close();
    requestAnimationFrame(() => {
      document.getElementById(target)?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
      history.replaceState(null, "", `#${target}`);
    });
  };

  return <>
    <a className="skip-link" href="#about">Skip to main content</a>
    <header ref={header} className="site-header" data-theme="dark">
      <a className="brand" href="#cinematic" aria-label="Dalmia Bharat, back to the beginning"><Image src="/images/dalmia-logo.png" alt="Dalmia Bharat" width={200} height={117} preload /></a>
      <nav className="desktop-nav" aria-label="Main navigation">{links.map(link => <a key={link.target} href={`#${link.target}`}>{link.label}</a>)}</nav>
      <button ref={toggle} className="menu-toggle" aria-label="Open menu" aria-expanded={open} aria-controls="main-menu" onClick={() => { dialog.current?.showModal(); setOpen(true); }}><span className="menu-label">MENU</span><span className="menu-lines"><i /><i /></span></button>
    </header>
    <dialog ref={dialog} id="main-menu" className="menu-dialog" aria-label="Explore Dalmia Bharat" onClose={() => { setOpen(false); toggle.current?.focus({ preventScroll: true }); }}>
      <div className="menu-top"><Image src="/images/dalmia-logo.png" alt="Dalmia Bharat" width={200} height={117} /><button className="close-button" aria-label="Close menu" onClick={close}><span>CLOSE</span><span className="close-mark" /></button></div>
      <div className="menu-content"><p className="eyebrow">A LEGACY. A LIVING FUTURE.</p><nav aria-label="Expanded navigation">{links.map((link, index) => <a key={link.target} href={`#${link.target}`} onClick={event => navigate(event, link.target)}><span className="menu-index">0{index + 1}</span><span className="menu-link-label">{link.label}<small>{link.note}</small></span><Arrow diagonal /></a>)}</nav></div>
      <div className="menu-bottom"><span>CEMENTING A NATION</span><a href="#cinematic" onClick={event => navigate(event, "cinematic")}>Back to the beginning <Arrow /></a><span>A HOMEPAGE CONCEPT</span></div>
    </dialog>
  </>;
}

