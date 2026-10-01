# Implementation status

Documentation updated: 2026-10-01. Last committed and deployed application baseline: c7e6180ac1817de80df04f03b77056e62405f459. The 2026-10-01 changes below are in the working tree only: not committed, not pushed, not deployed.

The Recorded validation table is the last validation of the deployed baseline; the 2026-10-01 section records what was run on the working tree. Tests were not rerun merely to write these Markdown documents. Recheck current code and relevant behavior after future changes.

## Completed features

| Area | Status |
| --- | --- |
| Cinematic | Fullscreen film pinned over 350vh; forward/reverse seeking |
| Current video | 30.04-second native 1280×720 film; 12,542,547-byte web encode (2026-10-01, local) |
| Master | 720p.mp4 hash verified unchanged during encoding |
| Delivery | One URL shared across desktop, mobile and native film player |
| Chapters | Three HTML overlays retimed to new scenes; clickable indicator |
| Loading/fallback | Posters, loading status, timeout/error recovery, skip and native playback |
| Finale | Last 16% holds final frame; CTA goes to About |
| Continuation | Final decoded frame stays behind all sections/footer |
| Opening enhancement | Finite architectural drawing, red accent, desktop mouse parallax |
| Smooth scrolling | Lenis wheel smoothing; native touch, keyboard and anchors; paused under dialogs (2026-10-01, local) |
| Continuation camera | Rack focus behind Our World on all motion-enabled devices; desktop push-in and pull-back (2026-10-01, local) |
| Type and header polish | Lining numerals for chapter years; blurred header backing over content (2026-10-01, local) |
| Dust removal | Atmospheric components, renderer, canvases and old effect tests deleted |
| Navigation | Fixed white header, working anchors, responsive native-dialog menu |
| Homepage | About, Our World and Closing only |
| Accessibility | Focus handling, dialogs, hidden/inert panels and reduced motion |
| Hosting | GitHub Pages static export on main, production verified |

## Recorded validation

| Check | Result at application baseline |
| --- | --- |
| npm run typecheck | Passed |
| npm run lint | Passed |
| npm run test:e2e | 16 passed |
| npm run build:pages | Passed |
| Live desktop 1440×900 | New opening; zero dust canvases; no missing assets/runtime errors |
| Live mobile 390×900 | Same checks passed; native playback exercised |
| Scrubbing | Forward/reverse, final hold, return from content verified |
| Mobile throttling | About 4.4 seconds to ready frame at simulated 3 Mbps / 100 ms |
| Media pipeline | H.264/yuv420p/24fps, faststart, maximum ~0.3334-second keyframe gap verified |

Timing observations are measurements, not guarantees. The media pipeline was verified when the new film was integrated; the subsequent dust removal did not change video bytes.

Application deployment: [Actions run 36396140882](https://github.com/resourceforproductivity-art/dalmia-cementing-a-nation/actions/runs/36396140882), completed successfully. [Live homepage](https://resourceforproductivity-art.github.io/dalmia-cementing-a-nation/).

## Changes and validation — 2026-10-01 (working tree, unpublished)

Context: the user asked how to bring the site closer to mont-fort.com, chose to keep the existing video, and approved proceeding with scroll, type, header and continuation-background improvements.

Changed:

- Added the lenis dependency and src/components/smooth-scroll.tsx; imported lenis/dist/lenis.css in layout.tsx; rendered SmoothScroll in page.tsx; data-lenis-prevent on both dialogs.
- Chapter years use lining numerals.
- Header gains data-surface and a masked blur backing once content is beneath it.
- cinematic.tsx gains the .stage-focus layer; reveals.tsx gains the rack focus and replaces the single 1→1.12 zoom with a push-in/pull-back timeline.
- tests/homepage.spec.ts gains one test for wheel smoothing, dialog scroll isolation, header surface, lining numerals and the rack focus.
- Corrected the Vercel leftover description in the architecture document.
- Added .claude/launch.json (dalmia-dev, port 3020) so the Claude desktop preview pane can start the dev server. The page loaded there with the film ready and Lenis active.

Checks actually run on 2026-10-01, locally, at 1440×900 unless a test sets its own viewport:

| Check | Result |
| --- | --- |
| npm run typecheck | Passed |
| npm run lint | Passed |
| npm run test:e2e | 17 passed |
| npm run build:pages | Passed |
| One-off wheel script (artifacts/verify-smooth.mjs, ignored) | Wheel glide gradual; wheel forward reached the final frame and wheel back returned to 0; no page errors. Run before the dialog fix below |
| Screenshot review | 1904 and MID-1930s numerals, Our World defocus at 1440 and 390, Closing/footer sharp, header backing |

Found and fixed during this work: the first version let a wheel glide continue under a freshly opened menu. The new test caught it, and SmoothScroll now stops Lenis while a dialog is open.

Not done or not verified:

- Nothing was committed, pushed or deployed; the live site is still c7e6180.
- Wheel feel was checked by script and screenshots, not by hand on a physical mouse or trackpad, and not in Safari or Firefox.
- The camera turn point is measured once; after a large resize it is approximate until reload.
- The cost of backdrop-filter and CSS blur was not profiled on low-end hardware.
- npm audit reports a critical advisory for next 16.2.0–16.3.5 (next/og ImageResponse, GHSA-vcvr-r3jv-pc5j). The repository has no next/og usage and ships a static export; the version was left unchanged. The suggested fix is next 16.3.8.
- Still open from the Mont-Fort review and needing the user's input: factual copy to replace the abstract lines, confirmation of the 1904 chapter date, and an optional film-grain overlay. The resolution question was answered by the user's 720p film.

## Film replacement — 2026-10-01 (working tree, unpublished)

The user added 720p.mp4 to the project root and said the video had been changed. Inspection showed a re-made film, not an upscale: 1280 × 720, 24 fps, 721 frames (30.04 s), new statue-assembly, stone, railway and plant shots, plus houses around the plant.

Changed:

- scripts/optimize-video.mjs and verify-video.mjs now target 720p.mp4 and cementing-a-nation-v3-720p.mp4 (CRF 23, twelve-frame GOP, no tune). New poster, finale and editorial stills are film-*-v3.
- cinematic.tsx: new source and stills, data-quality 720p, chapter 2 target 0.46, indicator thresholds 0.30/0.61, retimed fades, earlier opening-art fade, new .film-side-shade element.
- globals.css: chapter 2 moved to the right at a smaller size, side scrim, chapter text shadow, mobile default object-position 47%.
- reveals.tsx: camera push target moved to the new tower position (xPercent 0.6, yPercent 2).
- page.tsx: About image is film-detail-v3.jpg with updated alt text.
- tests/video-delivery.spec.ts: 720p, 30.042 s, v3 filename.
- Superseded v2 web film and stills moved to artifacts/superseded and removed from the Git index (staged, not committed).

Checks actually run after these changes, locally:

| Check | Result |
| --- | --- |
| npm run typecheck | Passed |
| npm run lint | Passed |
| npm run test:e2e | 17 passed; first frame about 0.5 s locally, 5.0 s at simulated 3 Mbps / 100 ms |
| node scripts/verify-video.mjs | Passed: master hash, 1280x720, yuv420p, 24 fps, 61 keyframes, 0.5 s maximum gap, faststart |
| npm run build:pages | Passed; out/ contains only the v3 film and stills |
| Screenshot review at 1440×900 and 390×844 | Eleven scroll positions plus About, Our World and Closing inspected; chapter 2 moved right after the first pass showed it covering the stone |

Not done or not verified:

- Not committed, pushed or deployed. The live site still shows the 480p film.
- No physical phone test. The web film is 12.5 MB against 7.1 MB before; only the simulated 3 Mbps case was measured.
- No objective quality metric (SSIM/VMAF) was computed for the encode; CRF was chosen by visual comparison of one crop.
- At about 19 s on desktop the growing stone reaches the left edge of the chapter 2 year just as that text fades.
- The master contains an audio track; the web film still omits audio.
- The 480p master is no longer in the project root, so the previous encode cannot be reproduced from this folder.

## Committed tests

| File | Count | Coverage |
| --- | ---: | --- |
| tests/homepage.spec.ts | 12 | Seeking/pin, chapters, menu, three responsive widths, native playback, fallback, continuous background, plus wheel smoothing/dialog isolation/rack focus (this twelfth test is not committed yet) |
| tests/opening.spec.ts | 1 | No canvas, mouse response, opening hide/restore, skip and reduced motion |
| tests/video-delivery.spec.ts | 4 | Desktop/mobile source, resize, duration/resolution, throttled seeking and reduced-motion requests |

Playwright uses one worker, installed Google Chrome, port 3020 and a default 1440×900 viewport. GitHub Actions currently runs lint/build, not this browser suite.

## Decision history — latest wins

| Earlier direction | Current decision |
| --- | --- |
| Short ~12-second film, then the 29.67-second 480p film | User replaced both; current film is 30.04 seconds at 720p |
| 720p only, then native 480p | User supplied a re-made 720p film on 2026-10-01; native 720p on every device |
| Two responsive encodes | Exactly one 720p web MP4 |
| Off-white sections/plain footer | Transparent sections over the final frame |
| Vercel | GitHub Pages is active |
| Thick particles/light beams | Removed |
| Mont-Fort cloud recreation | Removed at user's request |
| Empty initial landscape | Brief architectural opening |
| Static held frame behind content | Same frame with rack focus and camera move |
| Possible WebGL rebuild to match Mont-Fort | User keeps the video |

Recent commits: 8cf92a6 integrated the new film; c7e6180 removed atmospheric effects and added the prologue. Older experiments in Git or artifacts are historical, not requirements.

## Known limitations

- Native 720p is still below full-HD; it is stretched on 1080p and larger displays, though far less than the 480p film was.
- Physical iOS/Safari and Android hardware were unavailable. Chrome/viewport emulation passed; device decoding can differ.
- The site is a demo with no extra business pages, production workflows or forms.
- Runtime duration is automatic, but scripts/tests, the 24 fps final-frame calculation and chapter timing assume this exact film.
- Local artifacts and helpers are ignored and may be absent from a fresh clone.
- The source master is not in Git. A clone can run using optimized media but cannot reproduce encoding without the supplied source.
- Decorative prologue and animated pinning are omitted in reduced-motion/fallback mode intentionally.

## Documentation maintenance — 2026-09-29

- Created all six plan documents from the application source and recorded implementation baseline. Added entry points in AGENTS.md, CLAUDE.md and README.md.
- Saved the user's standing instruction in AGENTS.md, CLAUDE.md, the project index and continuation guide: review all six plan files after every project change and update affected documents and this status automatically.
- Documentation validation: all six expected files present, 18 local Markdown links and both Claude imports resolve.
- Application code, media and deployment remain at the recorded baseline. Documentation edits have not been published; the application checks above are historical, not new test runs.

## Outstanding work

The 2026-10-01 improvements are implemented locally and await the user's decision to commit and publish. Otherwise no required feature work remains. The LLM handoff and its standing maintenance instruction are implemented. Suggestions in [next steps](05_MULTI_ROLE_NEXT_STEPS.md) are optional, not an active backlog or authorization to expand scope.
