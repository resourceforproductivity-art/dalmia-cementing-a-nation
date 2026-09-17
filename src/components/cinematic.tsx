"use client";

import { assetPath } from "@/lib/asset-path";
import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Arrow } from "./arrow";

gsap.registerPlugin(ScrollTrigger);

const chapters = [
  { year: "1904", label: "A Vision Takes Form", position: 0.08, name: "THE VISION" },
  { year: "MID-1930s", label: "One Stone Changed Everything", position: 0.36, name: "THE FOUNDATION" },
  { year: "1939", label: "Industry Rose. Communities Grew.", position: 0.64, name: "THE MOMENTUM" },
];

export function Cinematic() {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const selectedSource = useRef<string | null>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const filmDialog = useRef<HTMLDialogElement>(null);
  const player = useRef<HTMLVideoElement>(null);
  const watchButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const section = root.current;
    const film = video.current;
    if (!section || !film) return;
    // Choose once per visit. No server-rendered src means the browser cannot
    // speculatively download desktop video before checking the device.
    // Keep the selection on resize/orientation changes to avoid a second asset.
    selectedSource.current ??= window.matchMedia("(max-width: 767px), (pointer: coarse) and (max-width: 1024px)").matches
      ? assetPath("/videos/cementing-a-nation-480p.mp4")
      : assetPath("/videos/cementing-a-nation-720p.mp4");
    section.dataset.quality = selectedSource.current.includes("480p") ? "480p" : "720p";
    const media = gsap.matchMedia();
    media.add({ reduced: "(prefers-reduced-motion: reduce)", motion: "(prefers-reduced-motion: no-preference)" }, context => {
      const reduced = !!context.conditions?.reduced;
      const panels = Array.from(section.querySelectorAll<HTMLElement>(".chapter"));
      const chapterButtons = Array.from(section.querySelectorAll<HTMLButtonElement>(".chapter-button"));
      const finale = section.querySelector<HTMLElement>(".cinematic-finale")!;
      const progressBar = section.querySelector<HTMLElement>(".film-progress-fill")!;
      const loading = section.querySelector<HTMLElement>(".film-loading")!;
      let duration = 0;
      let desiredTime = 0;
      let seekFrame = 0;
      let watchdog = 0;
      let previousChapter = -1;
      let previousFinale = false;
      let disposed = false;
      let fallback = false;
      let ready = false;
      let timeline: gsap.core.Timeline | undefined;
      let loadingTimeout = 0;

      const activateFallback = () => {
        if (disposed || fallback) return;
        fallback = true;
        film.pause();
        cancelAnimationFrame(seekFrame);
        clearTimeout(watchdog);
        clearTimeout(loadingTimeout);
        timeline?.scrollTrigger?.kill();
        timeline?.kill();
        trigger.current = null;
        section.dataset.mode = "fallback";
        section.dataset.ready = "true";
        gsap.set(panels, { autoAlpha: 0 });
        panels.forEach(panel => panel.setAttribute("aria-hidden", "true"));
        gsap.set(finale, { autoAlpha: 1, y: 0 });
        finale.inert = false;
        finale.setAttribute("aria-hidden", "false");
        loading.setAttribute("aria-hidden", "true");
        ScrollTrigger.refresh();
      };

      // A single in-flight seek. New scroll updates replace the target, never
      // enqueue obsolete seeks or trigger React renders. GSAP smooths progress.
      const seek = () => {
        seekFrame = 0;
        if (disposed || fallback || !ready || film.seeking) return;
        if (Math.abs(film.currentTime - desiredTime) < 0.025) return;
        try {
          film.currentTime = desiredTime;
          clearTimeout(watchdog);
          watchdog = window.setTimeout(() => { if (film.seeking) activateFallback(); }, 3500);
        } catch { activateFallback(); }
      };
      const queueSeek = () => { if (!seekFrame) seekFrame = requestAnimationFrame(seek); };
      const onSeeked = () => { clearTimeout(watchdog); queueSeek(); };
      const onReady = () => {
        if (disposed || fallback || !Number.isFinite(film.duration) || film.duration <= 0) return;
        duration = film.duration;
        ready = true;
        section.dataset.ready = "true";
        section.dataset.duration = duration.toFixed(3);
        loading.setAttribute("aria-hidden", "true");
        clearTimeout(loadingTimeout);
        render();
      };
      const model = { progress: 0 };
      const render = () => {
        const p = model.progress;
        // The last 16% is a deliberate final-frame hold.
        desiredTime = Math.min(p / 0.84, 1) * Math.max(0, duration - 1 / 24);
        progressBar.style.transform = `scaleX(${p})`;
        const chapter = p < 0.27 ? 0 : p < 0.55 ? 1 : 2;
        if (previousChapter !== chapter) {
          previousChapter = chapter;
          chapterButtons.forEach((button, index) => button.setAttribute("aria-current", String(index === chapter)));
          section.dataset.chapter = String(chapter + 1);
        }
        const showFinale = p >= 0.82;
        if (previousFinale !== showFinale) {
          previousFinale = showFinale;
          finale.inert = !showFinale;
          finale.setAttribute("aria-hidden", String(!showFinale));
        }
        panels.forEach((panel, index) => panel.setAttribute("aria-hidden", String(showFinale || index !== chapter)));
        queueSeek();
      };

      section.dataset.ready = "false";
      section.dataset.mode = "scrub";
      finale.inert = true;
      if (reduced || film.error || !film.canPlayType("video/mp4")) {
        activateFallback();
      } else {
        film.addEventListener("loadeddata", onReady);
        film.addEventListener("canplay", onReady);
        film.addEventListener("seeked", onSeeked);
        film.addEventListener("error", activateFallback);
        const setDuration = () => { duration = Number.isFinite(film.duration) ? film.duration : 0; };
        film.addEventListener("loadedmetadata", setDuration);
        context.add(() => () => film.removeEventListener("loadedmetadata", setDuration));
        loadingTimeout = window.setTimeout(activateFallback, 14000);
        gsap.set(panels, { autoAlpha: 0, y: 0 });
        gsap.set(panels[0], { autoAlpha: 1 });
        gsap.set(finale, { autoAlpha: 0, y: 30 });
        timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            id: "dalmia-film", trigger: section, start: "top top",
            end: () => `+=${Math.round(window.innerHeight * 3.5)}`,
            pin: true, scrub: 0.55, anticipatePin: 1, invalidateOnRefresh: true,
          },
        });
        trigger.current = timeline.scrollTrigger!;
        timeline.to(model, { progress: 1, duration: 1, onUpdate: render }, 0)
          .to(panels[0], { autoAlpha: 0, y: -24, duration: 0.055 }, 0.22)
          .fromTo(panels[1], { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.06 }, 0.28)
          .to(panels[1], { autoAlpha: 0, y: -24, duration: 0.055 }, 0.49)
          .fromTo(panels[2], { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.06 }, 0.55)
          .to(panels[2], { autoAlpha: 0, y: -24, duration: 0.055 }, 0.75)
          .to(finale, { autoAlpha: 1, y: 0, duration: 0.065 }, 0.81)
          .to(".film-shade", { opacity: 0.8, duration: 0.1 }, 0.79);
        render();
        if (!film.getAttribute("src")) {
          film.src = selectedSource.current!;
          film.preload = "auto";
          film.load();
        }
        if (film.readyState >= 2) onReady();
        ScrollTrigger.refresh();
      }
      return () => {
        disposed = true;
        film.pause();
        cancelAnimationFrame(seekFrame);
        clearTimeout(watchdog);
        clearTimeout(loadingTimeout);
        film.removeEventListener("loadeddata", onReady);
        film.removeEventListener("canplay", onReady);
        film.removeEventListener("seeked", onSeeked);
        film.removeEventListener("error", activateFallback);
        trigger.current = null;
      };
    });
    return () => media.revert();
  }, []);

  const toChapter = (index: number) => {
    const scene = trigger.current;
    if (scene) window.scrollTo({ top: scene.start + (scene.end - scene.start) * chapters[index].position, behavior: "smooth" });
  };
  const exploreNext = () => {
    const scene = trigger.current;
    if (!scene || scene.progress >= 0.8) {
      document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
    } else if (scene.progress < 0.27) toChapter(1);
    else if (scene.progress < 0.55) toChapter(2);
    else window.scrollTo({ top: scene.start + (scene.end - scene.start) * 0.92, behavior: "smooth" });
  };
  const openFilm = () => {
    filmDialog.current?.showModal();
    document.body.style.overflow = "hidden";
    if (player.current && selectedSource.current && !player.current.getAttribute("src")) {
      player.current.src = selectedSource.current;
      player.current.load();
    }
    player.current?.play().catch(() => { /* Native controls remain available. */ });
  };
  const closeFilm = () => { filmDialog.current?.close(); };

  return <>
    <section ref={root} id="cinematic" className="cinematic" data-mode="scrub" data-ready="false" data-chapter="1" aria-label="Cementing a Nation, a cinematic Dalmia Bharat story">
      <Image className="film-poster" src={assetPath("/images/film-poster.webp")} alt="A sculptural figure beside a monumental stone" fill unoptimized preload sizes="100vw" />
      <Image className="fallback-poster" src={assetPath("/images/film-finale.jpg")} alt="A cinematic industrial landscape" fill sizes="100vw" />
      <video ref={video} className="cinematic-video" poster={assetPath("/images/film-poster.webp")} preload="none" muted playsInline disablePictureInPicture aria-hidden="true" tabIndex={-1} />
      <div className="film-shade" /><div className="film-vignette" />
      <div className="film-heading eyebrow"><span className="red-rule" /> CEMENTING A NATION <span className="film-heading-divider" /> A DALMIA BHARAT STORY</div>
      <p className="sr-only">Cementing a Nation. 1904: A Vision Takes Form. Mid-1930s: One Stone Changed Everything. 1939: Industry Rose. Communities Grew.</p>
      <div className="chapters">
        {chapters.map((chapter, index) => <div key={chapter.year} className={`chapter chapter-${index + 1}`} aria-hidden={index !== 0}>
          <p className="eyebrow chapter-kicker">0{index + 1}<span />{chapter.name}</p>
          <p className="chapter-year">{chapter.year}</p>
          <h2>{index === 0 ? <>A Vision<br /><em>Takes Form.</em></> : index === 1 ? <>One Stone<br /><em>Changed Everything.</em></> : <>Industry Rose.<br /><em>Communities Grew.</em></>}</h2>
        </div>)}
      </div>
      <div className="cinematic-finale" aria-hidden="true">
        <p className="eyebrow">FROM A SINGLE VISION. TO A SHARED FUTURE.</p>
        <h1><span>CEMENTING</span><span>A <em>NATION</em></span></h1>
        <p className="finale-description">A legacy built on strength, trust and progress.</p>
        <a className="round-link finale-link" href="#about">EXPLORE DALMIA<span><Arrow /></span></a>
      </div>
      <nav className="chapter-rail" aria-label="Film chapters">{chapters.map((chapter, index) => <button key={chapter.year} className="chapter-button" aria-current={index === 0 ? "true" : "false"} aria-label={`Chapter 0${index + 1}: ${chapter.year}, ${chapter.label}`} onClick={() => toChapter(index)}><span className="chapter-rail-label">{chapter.name}</span><span className="chapter-number">0{index + 1}</span><i /></button>)}</nav>
      <div className="film-bottom">
        <span className="film-note eyebrow">STRENGTH. TRUST. PROGRESS.</span>
        <button className="scroll-cue eyebrow" onClick={exploreNext}><span className="scroll-line" />SCROLL TO EXPLORE</button>
        <a className="skip-intro eyebrow" href="#about">SKIP INTRO <Arrow /></a>
      </div>
      <button ref={watchButton} className="watch-film eyebrow" onClick={openFilm}><span className="play-icon" /> WATCH FILM</button>
      <div className="film-loading" role="status"><span />PREPARING YOUR JOURNEY</div>
      <div className="film-progress" aria-hidden="true"><div className="film-progress-fill" /></div>
      <noscript><style>{`.cinematic .chapter,.chapter-rail,.scroll-cue,.film-loading,.watch-film{display:none!important}.cinematic-finale{opacity:1!important;visibility:visible!important}.cinematic{height:100svh}.cinematic-video{display:none}.fallback-poster{opacity:1!important}`}</style></noscript>
    </section>
    <dialog ref={filmDialog} className="film-dialog" aria-label="Cementing a Nation film" onClose={() => { player.current?.pause(); document.body.style.overflow = ""; watchButton.current?.focus({ preventScroll: true }); }}>
      <button className="close-button" onClick={closeFilm} aria-label="Close film"><span>CLOSE FILM</span><span className="close-mark" /></button>
      <video ref={player} poster={assetPath("/images/film-poster.webp")} controls muted playsInline preload="none" aria-label="Cementing a Nation, supplied cinematic film" />
      <p>A Dalmia Bharat story · Scroll to explore the full experience.</p>
    </dialog>
  </>;
}
