"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Weighted wheel scrolling. Anchors, keyboard, touch and programmatic scrolls stay native. */
export function SmoothScroll() {
  useEffect(() => {
    // Lenis honours prefers-reduced-motion itself and leaves touch scrolling native.
    const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.9 });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    // A glide in progress must not carry on beneath the menu or film dialog.
    const dialogs = new MutationObserver(() => { if (document.querySelector("dialog[open]")) lenis.stop(); else lenis.start(); });
    document.querySelectorAll("dialog").forEach(dialog => dialogs.observe(dialog, { attributes: true, attributeFilter: ["open"] }));
    return () => { dialogs.disconnect(); gsap.ticker.remove(tick); lenis.destroy(); };
  }, []);
  return null;
}
