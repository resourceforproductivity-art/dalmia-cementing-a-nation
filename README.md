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

One 720p MP4 is published for desktop, tablet and mobile. It uses H.264 High, yuv420p, the native 24 fps, faststart, and closed eight-frame GOPs (one keyframe every 0.333 seconds) with no B-frames for responsive seeking.

| Version | Source dimensions preserved | Web size | Original size | Reduction |
| --- | --- | --- | --- | --- |
| All devices | 1280 × 720 | 8,502,942 bytes | 11,933,107 bytes | 28.7% |

- The supplied native 720p master is optimized directly, with no upscaling, cropping, frame-rate conversion, color grading or denoising.
- x264 uses `preset slow`, `tune grain`, and CRF 20 to retain dark texture and atmospheric detail. Measured average SSIM versus the corresponding master is 0.988899 (720p). SSIM is a similarity metric, not a guarantee of perceptual equivalence.
- The WebP poster is 13,414 bytes and is extracted from the supplied 720p source.
- Every screen size uses `/videos/cementing-a-nation-720p.mp4`, including after orientation changes and resizing. The optional film player reuses this URL.
- No MP4 `src` appears in server HTML. Reduced-motion visitors do not download the video unless they choose Watch Film.
- The 480p web encode has been removed. Mobile visitors now receive the same 8.5 MB video as desktop visitors.
- Duration is read from the video's metadata, currently 12.041667 seconds. A single in-flight seek follows smoothed ScrollTrigger progress without React renders per scroll frame. The final 16% holds the final frame.
- No 1080p or 4K web asset is generated or served.

## Preserved masters

The supplied files remain untouched in the local project root, excluded from Git and deployment:

- `480p.mp4` — SHA-256 `4c1be5e8b0549dfdd05ff79abc8688e94d7c4e21821d02d0e348f62da3e13d78`
- `720p.mp4` — SHA-256 `bd6368cc7408cd277c5b0f7a0120710486cd324bd05b32d8211c14844808ea77`

The optimized 720p file is included under `public/videos/`. The original 480p file remains local for preservation and is not generated or served by the website.

To reproduce the 720p encode and poster, place the original `720p.mp4` master in the root and run:

```powershell
node scripts/optimize-video.mjs
node scripts/verify-video.mjs
```

The verifier checks master hashes when present, exactly one published 720p MP4, H.264/yuv420p/24fps, maximum keyframe spacing, and `moov` placement before `mdat` for faststart. Its report is written to `artifacts/video-validation.json`.

## Scope and interaction

- Next.js App Router, TypeScript, Tailwind CSS 4 and GSAP ScrollTrigger.
- Fullscreen opening pinned for 350vh, with synchronized HTML chapters, chapter buttons, loading state, skip intro and cinematic finale.
- Transparent dark fixed navigation, native-dialog responsive menu and smooth section links.
- The decoded final video frame remains fixed behind all three following sections and the footer. A continuous scrim keeps type readable without opaque section backgrounds.
- Mont-Fort-inspired spatial motion: slow background camera drift, perspective heading reveals, independently moving image planes, restrained pointer tilt and layered atmospheric depth. Desktop motion is reduced on touch devices and disabled for reduced-motion visitors.
- Procedural cloud banks replace the former dust grains and light shafts. A WebGL density shader makes the clouds billow continuously; mouse movement deforms the clouds through a diffusing displacement field, while a slower camera response moves near and far layers at different depths. The movement is recreated from the Mont-Fort reference, with original shaders and a palette suited to the Dalmia film. No reference assets or runtime code are shipped. Text areas stay clearer for readability.
- Cloud animation is capped at 60 fps on desktop and 24 fps with a smaller pixel/layer budget on mobile. It pauses in hidden tabs and open menus/film dialogs, and is disabled for reduced motion. If WebGL is unavailable or lost, the film and page remain available without the decorative effect.
- A separate static finale poster preserves the continuous background when video scrubbing is unavailable. Foreground film detail is a still from the supplied 720p master.
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

The Playwright suite uses installed Google Chrome (`channel: chrome`) and starts/reuses port 3020. On machines without Chrome, install it or change the Playwright channel and install Chromium. Tests cover decoded forward/reverse seeks, pinning, final-frame hold, menu focus/Escape, section links, 320/390/820px layouts, mobile playback, reduced motion, failed loading, 720p-only requests on all screen sizes, resize behavior and a throttled 3 Mbps/100ms mobile connection. Screenshots and generated reports live in ignored `artifacts/` and `test-results/` folders.

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
