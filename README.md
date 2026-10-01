# Dalmia Bharat — Cementing a Nation

A cinematic, single-page Next.js homepage concept for client presentation.

## Run locally

Node.js 20.9 or newer is required. Dependencies are already installed on the original machine. For a fresh checkout, run `npm ci` first.

```powershell
cd 'C:\Users\mohds\Documents\project\dalmia'
npm run dev -- --port 3020
```

Open http://127.0.0.1:3020. For a production presentation, stop the development server and run:

```powershell
npm run build
npm run start -- --port 3020
```

## Video delivery

The film supplied on 1 October 2026 is 30.04 seconds long (721 frames) at 1280 × 720 and 24 fps. It is a re-made film with new shots, not an upscale of the earlier 480p film. It is served at its native 720p resolution on all devices. One MP4 is published; the earlier 480p web film and its stills are no longer part of the site.

| Version | Source dimensions preserved | Web size | Original size | Reduction |
| --- | --- | --- | --- | --- |
| All devices | 1280 × 720 | 12,542,547 bytes | 59,900,237 bytes | 79.1% |

- H.264 High, yuv420p, native 24 fps, faststart, closed twelve-frame GOPs (one keyframe every 0.5 seconds) and no B-frames support responsive seeking.
- The source is encoded directly with no upscaling, cropping, frame-rate conversion, color grading or denoising. Audio is omitted from the muted web experience; the master retains its audio.
- x264 uses preset slow and CRF 23. Trial encodes at CRF 20 with tune grain (26.6 MB) and CRF 24 (10.6 MB) were compared by eye on a crop of the stone; CRF 23 was chosen as the balance. No SSIM figure was measured for this encode.
- Every device and the optional film player use `/videos/cementing-a-nation-v3-720p.mp4`. Versioned asset names prevent cached copies of the previous film appearing after the update.
- The new WebP opening poster is 19,850 bytes. The finale poster and editorial stone still are also extracted from the replacement master.
- No MP4 src appears in server HTML. Reduced-motion visitors do not download video unless they choose Watch Film.
- Duration is read automatically from video metadata. A single in-flight seek follows smoothed ScrollTrigger progress without React renders per scroll frame. The final 16% holds the new final frame behind every following section.
- Chapter transitions follow the statue (0–9.5 s), stone and railway (13–19.5 s) and the open line where the plant rises (22–30 s). The stone chapter's target is about 16.4 seconds; the industry chapter enters at about 22.3 seconds with its target around 26.1 seconds.
- No 480p, 1080p or 4K web version is generated or served.

## Preserved master

The new supplied file remains untouched in the local project root, excluded from Git and deployment:

- `720p.mp4` — SHA-256 `11ddc035852c57a2e0c3f58768eec1b5a09b76ce8eaec5bde4e3e829a79cfdf2`

To reproduce the web encode and stills, place this master in the root and run:

```powershell
node scripts/optimize-video.mjs
node scripts/verify-video.mjs
```

The verifier checks the master hash when present, exactly one published native 720p MP4, the full replacement duration, H.264/yuv420p/24fps, keyframe spacing and faststart. Its report is written to `artifacts/video-validation.json`.

## Scope and interaction

- Next.js App Router, TypeScript, Tailwind CSS 4, GSAP ScrollTrigger and Lenis wheel smoothing.
- Fullscreen opening pinned for 350vh, with synchronized HTML chapters, chapter buttons, loading state, skip intro and cinematic finale.
- Transparent dark fixed navigation, native-dialog responsive menu and smooth section links.
- The decoded final video frame remains fixed behind all three following sections and the footer. A continuous scrim keeps type readable without opaque section backgrounds.
- Mont-Fort-inspired spatial motion: slow background camera drift, perspective heading reveals, independently moving image planes, restrained pointer tilt and layered architectural depth. Desktop motion is reduced on touch devices and disabled for reduced-motion visitors.
- The opening landscape has a brief architectural line reveal: overlapping formwork outlines, a restrained red datum and gentle desktop mouse parallax. It fades during the first four seconds of the film and returns when scrolling back to the start. Mobile uses a compact composition; reduced motion and video fallback omit the prologue.
- The former dust/cloud overlay and WebGL renderer have been removed. No particle loops, fog textures or light-beam effects are loaded.
- A separate static finale poster preserves the continuous background when video scrubbing is unavailable. Foreground film detail is a still from the new supplied master.
- Exactly three homepage sections: About, Our World, Closing.
- Local fonts and imagery, keyboard navigation and focus management, reduced-motion support, video error recovery and mobile native playback.
- No CMS, database, API, business-detail pages, forms or invented company statistics.

## Validation

```powershell
npm run typecheck
npm run lint
npm run build
npm run test:e2e
node scripts/verify-video.mjs
```

The Playwright suite uses installed Google Chrome (`channel: chrome`) and starts/reuses port 3020. On machines without Chrome, install it or change the Playwright channel and install Chromium. Tests cover decoded forward/reverse seeks, pinning, final-frame hold, menu focus/Escape, section links, 320/390/820px layouts, mobile playback, reduced motion, failed loading, wheel smoothing, dialog scroll isolation, the continuation rack focus, 720p-only requests on all screen sizes, resize behavior and a throttled 3 Mbps/100ms mobile connection. Screenshots and generated reports live in ignored `artifacts/` and `test-results/` folders.

## Publishing

The demo is published on GitHub Pages. Pushes to `main` run the lint/build workflow and deploy the static export. Only optimized media in `public/` is served; the original masters remain local. The site retains an independent-demo disclaimer and `noindex` metadata.

## Asset credits

- Logo: https://www.dalmiabharat.com/wp-content/uploads/2026/04/dbg-new-logo.png
- Cement: https://www.dalmiabharat.com/wp-content/uploads/2020/11/thebest-cement-company-in-India.jpg
- Sustainability: https://www.dalmiabharat.com/wp-content/uploads/2020/08/lowest-co2.jpg
- Innovation: https://www.dalmiacement.com/dalmia-bharat-ci/dalmia_bharat_ar/assets/images/smart-manufacturing/innovation_bg.jpg
- Innovation source: https://www.dalmiacement.com/dalmia-bharat-ci/dalmia_bharat_ar/smart-manufacturing-for-strong-bharat.html
- Interaction reference: https://mont-fort.com/
- Fonts: locally bundled Manrope and Cormorant Garamond via Fontsource (licenses accompany the npm packages).

Brand imagery belongs to its respective owners and is used for this independent presentation demo. Chapter dates and lines follow the creative brief. The supplied film is a conceptual narrative, not labelled archival footage.

## Limitations

Physical iOS/Safari and Android devices were not available; Chrome and mobile/tablet viewport emulation were tested. Device decoding and network conditions can affect scrubbing; a static finale and native film player are provided as fallbacks. Editorial panels are presentation elements rather than extra pages.

## GitHub Pages deployment

A verified static export is prepared for `/dalmia-cementing-a-nation/`:

```powershell
npm run build:pages
```

The result is in `out/`. Local assets, fonts, video delivery and navigation support the repository subpath. Desktop and mobile export checks passed with forward/reverse seeks and exactly one video URL per device. `.github/workflows/pages.yml` builds and publishes on pushes to main after Pages is enabled with GitHub Actions as its source.

GitHub Pages is enabled on the public repository with user approval. The GitHub Actions workflow publishes the tested static export on each push to main. The original masters remain local and excluded from Git and deployment.

Website: https://resourceforproductivity-art.github.io/dalmia-cementing-a-nation/
Repository: https://github.com/resourceforproductivity-art/dalmia-cementing-a-nation

## LLM handoff

For Claude, Codex or another assistant, start with [plan/00_PROJECT_INDEX.md](plan/00_PROJECT_INDEX.md). The six numbered files cover current architecture, interaction logic, design, implementation status and continuation procedures. CLAUDE.md and AGENTS.md point to the index. Keeping all six plan files current after every project change is a standing user requirement; review them before completing work and update affected documents plus the implementation status.
