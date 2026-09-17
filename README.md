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

Exactly two MP4 files are published. Both use H.264 High, yuv420p, the native 24 fps, faststart, and closed eight-frame GOPs (one keyframe every 0.333 seconds) with no B-frames for responsive seeking.

| Version | Source dimensions preserved | Web size | Original size | Reduction |
| --- | --- | --- | --- | --- |
| Desktop/laptop | 1280 × 720 | 8,502,942 bytes | 11,933,107 bytes | 28.7% |
| Mobile | 854 × 480 | 3,014,113 bytes | 7,599,809 bytes | 60.3% |

- Each supplied native-resolution master is optimized directly, with no upscaling, cropping, frame-rate conversion, color grading or denoising.
- x264 uses `preset slow`, `tune grain`, and CRF 20 to retain dark texture and atmospheric detail. Measured average SSIM versus the corresponding master is 0.988899 (720p) and 0.989892 (480p). SSIM is a similarity metric, not a guarantee of perceptual equivalence.
- The WebP poster is 13,414 bytes and is extracted from the supplied 720p source.
- Initial device width/pointer capability selects one video URL after hydration. No MP4 `src` appears in server HTML, so desktop media is never speculatively fetched on mobile.
- Narrow screens (up to 767px), and coarse-pointer screens up to 1024px, select 480p. Other screens select 720p.
- Selection remains fixed for that visit, including orientation changes and resizing. The optional film player reuses the same URL. Reduced-motion visitors do not download a video unless they choose Watch Film.
- Duration is read from the selected video's metadata, currently 12.041667 seconds. A single in-flight seek follows smoothed ScrollTrigger progress without React renders per scroll frame. The final 16% holds the final frame.
- No 1080p or 4K web asset is generated or served.

## Preserved masters

The supplied files remain untouched in the local project root, excluded from Git and deployment:

- `480p.mp4` — SHA-256 `4c1be5e8b0549dfdd05ff79abc8688e94d7c4e21821d02d0e348f62da3e13d78`
- `720p.mp4` — SHA-256 `bd6368cc7408cd277c5b0f7a0120710486cd324bd05b32d8211c14844808ea77`

Optimized files are included in the repository under `public/videos/`. The previous redundant served master copy was removed only after its hash matched the preserved `480p.mp4`.

To reproduce the two encodes and poster, place the original master files in the root and run:

```powershell
node scripts/optimize-video.mjs
node scripts/verify-video.mjs
```

The verifier checks master hashes when present, exactly two published MP4s, H.264/yuv420p/24fps, maximum keyframe spacing, and `moov` placement before `mdat` for faststart. Its report is written to `artifacts/video-validation.json`.

## Scope and interaction

- Next.js App Router, TypeScript, Tailwind CSS 4 and GSAP ScrollTrigger.
- Fullscreen opening pinned for 350vh, with synchronized HTML chapters, chapter buttons, loading state, skip intro and cinematic finale.
- Transparent/light fixed navigation, native-dialog responsive menu and smooth section links.
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

The Playwright suite uses installed Google Chrome (`channel: chrome`) and starts/reuses port 3020. On machines without Chrome, install it or change the Playwright channel and install Chromium. Tests cover decoded forward/reverse seeks, pinning, final-frame hold, menu focus/Escape, section links, 320/390/820px layouts, mobile playback, reduced motion, failed loading, responsive single-file requests, resize behavior and a throttled 3 Mbps/100ms mobile connection. Screenshots and generated reports live in ignored `artifacts/` and `test-results/` folders.

## Publishing

The project is ready for Vercel's Next.js preset. `.vercelignore` excludes local masters and test artifacts. Only optimized media in `public/` is served. Video responses use a one-day cache with stale-while-revalidate. The site retains an independent-demo disclaimer and `noindex` metadata.

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

## GitHub Pages alternative

A verified static export is prepared for `/dalmia-cementing-a-nation/`:

```powershell
npm run build:pages
```

The result is in `out/`. Local assets, fonts, video selection and navigation support the repository subpath. Desktop and mobile export checks passed with forward/reverse seeks and exactly one video URL per device. `.github/workflows/pages.yml` builds and publishes on pushes to main after Pages is enabled with GitHub Actions as its source.

GitHub returned that the current account plan does not support Pages for this private repository. Publishing with this plan requires approval to make the repository public. The prepared Pages changes have not yet been published, and repository visibility is unchanged. The original masters remain local and excluded from Git and deployment.
