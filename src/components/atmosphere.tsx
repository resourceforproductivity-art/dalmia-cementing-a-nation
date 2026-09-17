"use client";

import { useEffect, useRef } from "react";
import { createAtmosphere } from "@/lib/atmosphere";

/** Decorative air occupies both sides of the content, never the interaction layer. */
export function Atmosphere() {
  const distant = useRef<HTMLCanvasElement>(null);
  const near = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const back = distant.current;
    const front = near.current;
    if (!back || !front) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let dispose = () => {};
    const configure = () => {
      dispose();
      dispose = () => {};
      back.dataset.state = front.dataset.state = "off";
      if (!motion.matches) dispose = createAtmosphere(back, front);
    };
    configure();
    motion.addEventListener("change", configure);
    return () => { motion.removeEventListener("change", configure); dispose(); };
  }, []);

  return <>
    <canvas ref={distant} className="atmosphere atmosphere-distant" data-state="off" aria-hidden="true" />
    <canvas ref={near} className="atmosphere atmosphere-near" data-state="off" aria-hidden="true" />
  </>;
}
