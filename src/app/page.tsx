import { assetPath } from "@/lib/asset-path";
import Image from "next/image";
import { Header } from "@/components/header";
import { Cinematic } from "@/components/cinematic";
import { Atmosphere } from "@/components/atmosphere";
import { Reveals } from "@/components/reveals";
import { Arrow } from "@/components/arrow";

const worlds = [
  { name: "Cement", number: "01", image: "/images/cement.jpg", alt: "Dalmia cement plant illuminated at night", line: "Strength at the heart of possibility.", id: "cement" },
  { name: "Innovation", number: "02", image: "/images/innovation.jpg", alt: "A Dalmia researcher working in a materials laboratory", line: "A better way to build what comes next.", id: "innovation" },
  { name: "Sustainability", number: "03", image: "/images/sustainability.jpg", alt: "A Dalmia plant surrounded by trees and green landscape", line: "Progress, with the future in mind.", id: "sustainability" },
];

export default function Home() {
  return <>
    <Header />
    <main>
      <Cinematic />
      <Atmosphere />
      <Reveals>
        <section id="about" className="about-section section-shell" aria-labelledby="about-title">
          <div className="section-topline" data-reveal><p className="eyebrow"><span className="red-square" /> THE DALMIA SPIRIT</p><span className="eyebrow section-number">01 — ABOUT</span></div>
          <div className="about-heading" data-reveal><h2 id="about-title">Building<br /><em>Beyond Cement.</em></h2></div>
          <div className="about-body">
            <div className="about-image-wrap" data-reveal><div className="depth-float" data-parallax="-28"><figure className="about-image" data-tilt="-5"><Image src={assetPath("/images/film-detail.jpg")} alt="Monumental stone and sculpted figure from the Cementing a Nation film" fill sizes="(max-width: 767px) 90vw, 48vw" /><span className="image-corner corner-tl" /><span className="image-corner corner-br" /></figure></div><div className="image-caption eyebrow"><span>A VISION MADE TANGIBLE</span><span>DALMIA BHARAT</span></div></div>
            <div className="about-copy" data-reveal><span className="copy-rule" /><p className="about-lead">Some foundations<br />hold more than buildings.</p><p>They hold ambition. They connect communities. They give shape to what a nation can become.</p><p>At Dalmia Bharat, the story of cement is part of a larger story — of people, possibility and the resolve to keep moving forward.</p><a className="round-link" href="#our-world">DISCOVER OUR WORLD<span><Arrow /></span></a></div>
          </div>
          <div className="about-footnote eyebrow" data-reveal><span>ROOTED IN PURPOSE.</span><span>BUILT FOR POSSIBILITY.</span></div>
        </section>
        <section id="our-world" className="world-section section-shell" aria-labelledby="world-title">
          <div className="section-topline" data-reveal><p className="eyebrow"><span className="red-square" /> OUR WORLD</p><span className="eyebrow section-number">02 — POSSIBILITIES</span></div>
          <div className="world-heading" data-reveal><h2 id="world-title">One purpose.<br /><em>Many possibilities.</em></h2><p>Materials. Ideas. Responsibility.<br />The foundations of a world moving forward.</p></div>
          <div className="world-grid">{worlds.map(world => <article id={world.id} key={world.id} className={`world-panel panel-${world.id}`} data-reveal><div className="depth-float" data-parallax={world.number === "02" ? "-38" : "22"}><div className="panel-image" data-tilt={world.number === "02" ? "4" : "-4"}><Image src={assetPath(world.image)} alt={world.alt} fill sizes="(max-width: 767px) 90vw, (max-width: 1023px) 45vw, 33vw" /><div className="panel-shade" /><span className="panel-index eyebrow">{world.number} /</span><h3>{world.name}</h3></div></div><p>{world.line}</p></article>)}</div>
        </section>
        <section id="closing" className="closing-section section-shell" aria-labelledby="closing-title">
          <div className="section-topline" data-reveal><p className="eyebrow"><span className="red-square" /> THE NEXT CHAPTER</p><span className="eyebrow section-number">03 — TOMORROW</span></div>
          <div className="closing-main" data-reveal><h2 id="closing-title">Building a<br /><em>Stronger Tomorrow.</em></h2><div className="closing-support"><span className="closing-red-line" /><p>Our foundations are strong.<br />Our story is still being written.</p><a className="round-link" href="#cinematic">BACK TO THE BEGINNING<span className="arrow-up"><Arrow /></span></a></div></div>
          <footer className="site-footer"><div className="footer-main"><a className="footer-brand" href="#cinematic" aria-label="Dalmia Bharat, back to top"><Image src={assetPath("/images/dalmia-logo.png")} alt="Dalmia Bharat" width={200} height={117} /></a><nav aria-label="Footer navigation"><a href="#about">About</a><a href="#our-world">Businesses</a><a href="#sustainability">Sustainability</a></nav><p className="eyebrow">CEMENTING A NATION.</p></div><div className="footer-bottom"><span>Independent redesign concept. For presentation purposes only.</span><span>Brand and imagery belong to their respective owners.</span></div></footer>
        </section>
      </Reveals>
    </main>
  </>;
}
