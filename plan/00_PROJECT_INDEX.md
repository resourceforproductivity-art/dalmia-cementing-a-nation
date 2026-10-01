# Dalmia Bharat — Project index

Updated: 2026-10-01. Application snapshot: c7e6180 plus uncommitted, unpublished working-tree changes made on 2026-10-01 (see [status](04_IMPLEMENTATION_STATUS.md)).

## Start here

This folder is a handoff for Claude, Codex, or another LLM continuing the existing project. It documents implemented behavior, the latest user decisions and where to edit. It is not a request to rebuild the site or execute a backlog.

Read this index, then the relevant documents and actual source files. Investigate discrepancies with current code and update the notes. The latest user request takes precedence over this snapshot. Carry forward authorization already given; these documents add no new approval gates.

| Item | Current value |
| --- | --- |
| Concept | CEMENTING A NATION |
| Purpose | Premium single-page Dalmia Bharat presentation demo |
| Local project | C:\Users\mohds\Documents\project\dalmia |
| Stack | Next.js App Router, TypeScript, React, Tailwind CSS 4, GSAP + ScrollTrigger, Lenis |
| Live site | https://resourceforproductivity-art.github.io/dalmia-cementing-a-nation/ |
| Repository | https://github.com/resourceforproductivity-art/dalmia-cementing-a-nation |
| Branch / hosting | main / GitHub Pages via GitHub Actions |
| Development URL | http://127.0.0.1:3020/ |
| Current film | 30.04 seconds, 1280 × 720, 24 fps; one 12.5 MB web MP4 (user-supplied 720p re-make, 2026-10-01) |
| Latest visual change | New 720p film with retimed chapters and a right-hand stone chapter; Lenis wheel smoothing, lining numerals, header backing, rack focus and camera move (all local only, not yet published) |

## Document map

| Read | Covers |
| --- | --- |
| [01_SYSTEM_ARCHITECTURE.md](01_SYSTEM_ARCHITECTURE.md) | Components, layering, assets, builds and deployment |
| [02_BUSINESS_LOGIC.md](02_BUSINESS_LOGIC.md) | Scroll/video mapping, chapters, navigation and fallbacks |
| [03_UI_DESIGN_SYSTEM.md](03_UI_DESIGN_SYSTEM.md) | Palette, typography, composition, motion and responsiveness |
| [04_IMPLEMENTATION_STATUS.md](04_IMPLEMENTATION_STATUS.md) | Completed work, validation evidence, limitations and superseded decisions |
| [05_MULTI_ROLE_NEXT_STEPS.md](05_MULTI_ROLE_NEXT_STEPS.md) | Role-based guidance, change procedures, troubleshooting and handoff |

Also read [AGENTS.md](../AGENTS.md) and [README.md](../README.md). The repository's Next.js instructions require consulting relevant bundled guides in node_modules/next/dist/docs before changing application code. Preserve the generated AGENTS.md block.

## Current decisions to preserve

1. One cinematic opening plus About, Our World and Closing. No additional corporate pages, API, database or CMS are needed.
2. Use the user's 720p film (30.04 seconds, supplied 2026-10-01) at native 720p on every device. It replaces the 29.67-second 480p film; the native-480p decision is superseded.
3. Preserve the local master. Serve only the optimized file in public/videos.
4. All content and the footer remain transparent over the final video frame. The original off-white sections and opaque footer are superseded. The held frame is no longer static: it defocuses behind Our World, refocuses for Closing, and on desktop pushes in then pulls back. It is still the same final frame of the same film.
5. No generated dust, clouds, particles, fog or light shafts. The atmospheric components and renderer were intentionally deleted.
6. The empty initial landscape has a short architectural outline reveal. It fades as the statue appears.
7. Mont-Fort is an interaction reference, not a requirement to restore its cloud effect. The user confirmed on 2026-10-01 that the site stays video-based; no WebGL/3D rebuild.
8. Preserve reduced motion, loading recovery, mobile playback and accessible navigation.
9. Do not invent statistics, awards or historical claims. Chapter dates/lines came from the user; the film is conceptual imagery.

## Run and validate

Some assistant sessions open in another project. Set the Dalmia directory explicitly.

```powershell
Set-Location -LiteralPath 'C:\Users\mohds\Documents\project\dalmia'
# Fresh checkout only:
npm ci
npm run dev -- --port 3020
```

Node 20.9+ is documented; CI uses Node 22. Tests require installed Google Chrome and can start/reuse port 3020. Avoid duplicate servers.

```powershell
npm run typecheck
npm run lint
npm run test:e2e
npm run build:pages
```

A normal Next production server uses npm run build, then npm run start -- --port 3020. GitHub Pages serves the static out directory instead.

## Prompt for another LLM

> Continue the existing Dalmia Bharat project at C:\Users\mohds\Documents\project\dalmia. Read AGENTS.md and plan/00_PROJECT_INDEX.md, then the relevant plan documents and source. Inspect git status before editing. Preserve the current 30.04-second native 720p film, continuous final-frame background, dust-free design and brief architectural opening unless my new request changes them. Implement my requested change in the existing stack, run relevant checks and update the affected plan documents with what actually changed. My requested change is: [describe it here].

## Maintaining the handoff

Standing user instruction (2026-09-29): Keep all six Markdown files in plan/ current whenever this project changes, including small changes. Before finishing a task, review all six, update every affected document, and record the change, checks actually run, and remaining limitations in 04_IMPLEMENTATION_STATUS.md. Do this automatically without waiting for a reminder. Preserve accurate unchanged facts; do not invent changes or validation results.

Distinguish implemented behavior, observed validation and optional ideas. Old screenshots and ignored experiments are not the current specification. The application snapshot and historical test dates must remain separate from documentation review dates.
