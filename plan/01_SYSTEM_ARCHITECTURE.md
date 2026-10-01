# System architecture

Updated: 2026-10-01. See [the index](00_PROJECT_INDEX.md) for current constraints.

## Stack and execution model

package.json declares Next.js 16.3.5, React/React DOM 19.3.0, GSAP ^3.14.2, Lenis ^1.3.26, TypeScript ^5 and Tailwind CSS ^4. package-lock.json is the dependency-resolution source of truth. Fonts are local Fontsource packages.

There is no backend, authentication, database, CMS, analytics integration or runtime third-party API. The server-component page composes client components for navigation and motion. Browser APIs run in effects/event handlers. GitHub Pages serves static HTML, JS, CSS, fonts and media; runtime Next server features and image optimization are unavailable there.

## File map

| File | Responsibility |
| --- | --- |
| src/app/layout.tsx | Metadata, local fonts and document shell |
| src/app/page.tsx | Single-page composition and editorial content |
| src/app/globals.css | Visual system, breakpoints and effect styles |
| src/components/header.tsx | Fixed navigation, native-dialog menu and the data-surface switch for its backing |
| src/components/cinematic.tsx | Film, scroll timeline, opening SVG and film dialog |
| src/components/reveals.tsx | Content reveals, image tilt, camera drift, continuation rack focus and push-in/pull-back |
| src/components/smooth-scroll.tsx | Lenis wheel smoothing driven by the GSAP ticker; pauses while a dialog is open |
| src/components/arrow.tsx | Reusable SVG arrows |
| src/lib/asset-path.ts | Deployment-subpath asset helper |
| scripts/optimize-video.mjs | FFmpeg encoding and still generation |
| scripts/verify-video.mjs | Master, codec, duration, GOP and faststart checks |
| scripts/build-pages.mjs | Pages environment and static export |
| next.config.ts | Conditional static configuration |
| .github/workflows/pages.yml | Build and deployment |
| tests/ | Committed Playwright coverage |
| plan/ | Portable LLM handoff |
| .claude/launch.json | Claude desktop preview entry dalmia-dev: npm run dev on port 3020 (untracked) |

The old src/components/atmosphere.tsx and src/lib/atmosphere.ts no longer exist. No canvas/WebGL effects layer remains.

## Layer ownership

Home renders SmoothScroll (no markup), Header, then main containing Cinematic and Reveals. Reveals wraps the three sections; the footer belongs to Closing. Cinematic returns its fixed stage separately from the pinned overlay.

| Layer | Responsibility |
| --- | --- |
| .cinematic-stage, fixed, z-index 0 | Film, loading/fallback stills and scrims throughout the page |
| .stage-camera / .stage-media | Separate targets for pointer drift and scroll zoom |
| .film-side-shade | Right-hand scrim for chapter 2, left-hand scrim from chapter 3 on; CSS opacity keyed to data-chapter; hidden below 768px |
| .stage-focus > .stage-focus-image, inside .stage-media | Blurred copy of film-finale-v3.jpg. Two nested opacities give the rack focus without two tweens sharing one property |
| .cinematic, z-index 2 | Pinned chapters, opening art, controls and finale |
| .opening-art, z-index 1 inside cinematic | Short decorative prologue; pointer-events:none |
| .continuation, z-index 2 | Transparent content over the final frame |
| .site-header, z-index 30 | Fixed white navigation. ::before is the film gradient; ::after is a masked blur backing shown when data-surface="content" |
| Native dialog top layer | Menu and optional film player |

Do not move the fixed stage into the pinned element or add a transformed ancestor without checking fixed positioning. That can break the final-frame background and reverse scrolling. Keep camera and media transform targets separate.

## Media inventory

| Asset | Role | Bytes |
| --- | --- | ---: |
| public/videos/cementing-a-nation-v3-720p.mp4 | Shared desktop/mobile film | 12,542,547 |
| public/images/film-poster-v3.webp | Loading poster | 19,850 |
| public/images/film-finale-v3.jpg | Static fallback background and source of the blurred rack-focus layer | 133,410 |
| public/images/film-detail-v3.jpg | About editorial image (stone and railway, 18 s) | 129,981 |
| public/images/dalmia-logo.png | Official logo | 9,599 |
| public/images/cement.jpg | Cement panel | 82,947 |
| public/images/innovation.jpg | Innovation panel | 173,961 |
| public/images/sustainability.jpg | Sustainability panel | 141,703 |

Local master: root-level 720p.mp4, 59,900,237 bytes, 1280 × 720, 24 fps, 721 frames, H.264 Main with AAC audio. SHA-256: 11ddc035852c57a2e0c3f58768eec1b5a09b76ce8eaec5bde4e3e829a79cfdf2. It is ignored by Git. The earlier 480p.mp4 master was no longer in the project root when this film was integrated; the assistant did not remove it. The superseded v2 web film and stills were moved to the ignored artifacts/superseded folder, not deleted. A fresh clone contains the web film but not the master. Never overwrite the master during encoding.

Web encoding: H.264 High, yuv420p, 24 fps, CRF 23, preset slow, no B-frames, faststart and twelve-frame closed GOPs (0.5 seconds). Audio is excluded from the web film; the master retains it. No resizing or grading is applied to the film. FFmpeg is supplied by ffmpeg-static.

The scripts target this specific master, filename, resolution, duration and frame rate. They are not a generic upload pipeline. Update their assumptions together when a replacement is requested.

## Deployment

assetPath(path) prepends NEXT_PUBLIC_BASE_PATH, defaulting to empty locally. Use it for public assets and metadata; root-only asset URLs can fail on Pages.

build-pages.mjs sets GITHUB_PAGES=true and NEXT_PUBLIC_BASE_PATH=/dalmia-cementing-a-nation. next.config.ts enables output: export, the base path, trailing slashes and unoptimized images. The build creates out/.nojekyll.

The GitHub Actions workflow runs on main pushes or manual dispatch: npm ci, npm run lint, npm run build:pages, artifact upload and Pages deployment. CI uses Node 22. TypeScript runs during the build. Playwright and verify-video.mjs are currently local checks, not workflow steps.

Repository owner: resourceforproductivity-art. Use the existing remote and established local Git authentication for authorized publication. Do not store credentials here. The tracked vercel.json and .vercelignore files are leftovers (there is no .vercel folder); Vercel is not the current release path.

## Generated/local-only files

node_modules, .next, out, artifacts, playwright-report, test-results, TypeScript build info, .vercel and .env files are ignored. Edit source rather than build output. artifacts contains local screenshots and one-off scripts, including obsolete experiments. It is not available reliably in a fresh clone.
