"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function Reveals({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add({ motion: "(prefers-reduced-motion: no-preference)", desktop: "(min-width: 1024px) and (hover: hover) and (pointer: fine)" }, match => {
      if (!match.conditions?.motion) return;
      const dispose: (() => void)[] = [];
      const context = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach(element => {
          gsap.from(element, { y: 36, opacity: 0, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: element, start: "top 93%", once: true } });
        });

        // A continuous scrim gives text contrast without introducing section backgrounds.
        gsap.fromTo(document.querySelector(".continuation-shade"), { opacity: 0 }, { opacity: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "top 30%", scrub: .8 } });
        if (!match.conditions?.desktop) return;
        gsap.fromTo(document.querySelector(".stage-media"), { scale: 1, yPercent: 0 }, { scale: 1.12, yPercent: -1.5, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom bottom", scrub: 1.4 } });
        // Independent scene and foreground movement creates a gentle camera drift.
        const camera = document.querySelector<HTMLElement>(".stage-camera");
        if (camera) {
          gsap.set(camera, { transformPerspective: 1600 });
          const cameraX = gsap.quickTo(camera, "x", { duration: 1.6, ease: "power2.out" });
          const cameraY = gsap.quickTo(camera, "y", { duration: 1.6, ease: "power2.out" });
          const cameraAngle = gsap.quickTo(camera, "rotationY", { duration: 1.6, ease: "power2.out" });
          let active = false;
          const reset = () => { cameraX(0); cameraY(0); cameraAngle(0); };
          ScrollTrigger.create({ trigger: root.current, start: "top bottom", end: "bottom top", onToggle: self => { active = self.isActive; if (!active) reset(); } });
          const drift = (event: PointerEvent) => {
            if (!active) return;
            const x = event.clientX / window.innerWidth - .5;
            const y = event.clientY / window.innerHeight - .5;
            cameraX(-x * 16); cameraY(-y * 10); cameraAngle(x * .65);
          };
          window.addEventListener("pointermove", drift, { passive: true });
          document.documentElement.addEventListener("pointerleave", reset);
          dispose.push(() => { window.removeEventListener("pointermove", drift); document.documentElement.removeEventListener("pointerleave", reset); });
        }
        gsap.utils.toArray<HTMLElement>(".about-heading h2, .world-heading h2, .closing-main h2").forEach(heading => {
          gsap.fromTo(heading, { z: -90, rotationX: 5, y: 28, transformPerspective: 1400 }, { z: 0, rotationX: 0, y: 0, ease: "none", scrollTrigger: { trigger: heading.parentElement, start: "top bottom", end: "top 30%", scrub: 1 } });
        });
        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach(element => {
          const distance = Number(element.dataset.parallax);
          gsap.fromTo(element, { y: -distance / 2 }, { y: distance / 2, ease: "none", scrollTrigger: { trigger: element.parentElement, start: "top bottom", end: "bottom top", scrub: 1.2 } });
        });

        gsap.utils.toArray<HTMLElement>("[data-tilt]").forEach(element => {
          const restingAngle = Number(element.dataset.tilt);
          gsap.set(element, { rotationY: restingAngle, rotationX: 2, transformPerspective: 1200 });
          const rotateX = gsap.quickTo(element, "rotationX", { duration: .8, ease: "power3.out" });
          const rotateY = gsap.quickTo(element, "rotationY", { duration: .8, ease: "power3.out" });
          const lift = gsap.quickTo(element, "z", { duration: .8, ease: "power3.out" });
          let bounds: DOMRect | null = null;
          const enter = () => { bounds = element.getBoundingClientRect(); lift(24); };
          const move = (event: PointerEvent) => {
            if (!bounds) return;
            const x = gsap.utils.clamp(-.5, .5, (event.clientX - bounds.left) / bounds.width - .5);
            const y = gsap.utils.clamp(-.5, .5, (event.clientY - bounds.top) / bounds.height - .5);
            rotateX(2 - y * 5);
            rotateY(restingAngle + x * 7);
          };
          const leave = () => { bounds = null; rotateX(2); rotateY(restingAngle); lift(0); };
          element.addEventListener("pointerenter", enter);
          element.addEventListener("pointermove", move);
          element.addEventListener("pointerleave", leave);
          dispose.push(() => {
            element.removeEventListener("pointerenter", enter);
            element.removeEventListener("pointermove", move);
            element.removeEventListener("pointerleave", leave);
          });
        });
      }, root);
      return () => { dispose.forEach(fn => fn()); context.revert(); };
    });
    return () => media.revert();
  }, []);
  return <div ref={root} className="continuation">{children}</div>;
}
