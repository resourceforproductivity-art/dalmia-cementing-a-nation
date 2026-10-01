# Multi-role next steps and continuation guide

Updated: 2026-10-01. Start with [the project index](00_PROJECT_INDEX.md).

Roles below are perspectives for future work. One assistant can use all of them. This document does not request agent spawning, parallel delegation, a rebuild, additional pages or another hosting provider.

## Before changing code

1. Read the latest user request and relevant plan documents.
2. Set the Dalmia working directory; inspect git status and affected source. Preserve unrelated edits.
3. Read AGENTS.md and relevant installed Next.js guides before application changes.
4. Follow current scope and existing authorization. Clarify a material unresolved choice, not routine implementation decisions.
5. Choose meaningful checks for the change. Visually inspect motion/layout in a browser.

## Role guide

| Perspective | Typical files | Responsibility |
| --- | --- | --- |
| Creative / UI | globals.css, page.tsx, cinematic.tsx | Composition, type, spacing, subject visibility and responsive design |
| Motion / frontend | cinematic.tsx, reveals.tsx | Reversible seeking, effect scope, independent transforms, cleanup |
| Media / performance | Encoding scripts, public media | Preserve master/quality, efficient seeks, one-source delivery, cache-safe names |
| QA / accessibility | tests, browser, dialogs | Focus, reduced motion, real interactions, assets and viewport checks |
| Release / documentation | Pages script/workflow, README, plan | Base path, export/deployment verification and accurate handoff |

If future user instructions explicitly use several agents, agree on ownership of shared files. Otherwise work normally without delegation.

## Common changes

### Replace the film

Inspect actual duration, dimensions, fps, aspect ratio, color metadata and audio first; filenames can mislead. Review scene samples and the final frame. Preserve the master and record its hash.

Follow the current user-approved delivery choice. Resolve a conflict with an earlier resolution requirement before producing a different-resolution version. Do not silently upscale, crop or change appearance. Encode only the requested version using H.264/yuv420p, frequent keyframes and faststart.

Use new media filenames for changed content. Update filmSource, both video posters, fallback still, the .stage-focus background and source-derived editorial imagery. Recheck which side of the frame each chapter's subject occupies, then the chapter positions, the .film-side-shade directions, the mobile object-position values and the camera push target in reveals.tsx. Update the optimizer, verifier hash/metadata and duration-specific tests. Review 1/24 if fps changes. Retune chapters to the scenes. Remove superseded web files once the replacement works; preserve the master.

Run media verification and browser delivery/seeking checks. Confirm the final frame behind content and no additional video download on resize. Update the plan and README.

### Change the opening effect

Edit .opening-* markup/animation in cinematic.tsx and its CSS. Keep it brief, noninteractive and clear of type/subjects. Its current scroll fade ends at 0.12. Preserve reverse-scroll return, reduced-motion hiding and fallback hiding.

Do not restore the deleted dust/cloud renderer unless the user changes that preference. Check initial render, finished drawing, forward/reverse scroll, Skip Intro, direct anchor entry and menu interaction. Inspect desktop/mobile and run tests/opening.spec.ts plus relevant homepage checks.

### Change scrolling or the continuation background

Lenis lives only in smooth-scroll.tsx. Keep anchors off and leave programmatic scrolling native unless every scrollTo/scrollIntoView call is migrated together. Any new dialog needs data-lenis-prevent; the open-attribute observer covers dialogs present at mount.

The rack focus uses two nested elements on purpose. Do not collapse them into one element with two scrubbed opacity tweens. The camera timeline owns scale/xPercent/yPercent on .stage-media; pointer drift owns x/y/rotationY on .stage-camera. Keep the film at its final frame; the blurred layer is film-finale-v3.jpg and must be replaced together with the film.

Run the whole Playwright suite; the last homepage test covers this area.

### Change content, imagery or spacing

Use page.tsx and globals.css. Prefix local assets through assetPath. Preserve three sections and existing anchors. Keep copy minimal and factual. Inspect CSS overrides near the bottom of the stylesheet. Keep continuation backgrounds transparent.

Check 320px, 390px, 820px and desktop composition when layout/type changes. Avoid collisions with the main video subject, header, rail and controls.

### Publish an authorized change

Run relevant checks and npm run build:pages. Review the diff and include intended source/assets only. Push to existing main when publication is within the current request or authorization. A successful push alone does not prove the live site changed.

Wait for the Pages workflow result, then verify the public site in a fresh browser session: correct media, seeking, menu/anchors, final-frame background and changed visual behavior. Inspect missing assets if filenames/base paths changed. Report any unverified portion accurately.

Do not commit the master, credentials, local artifacts or build output. Legacy Vercel files are not the release workflow.

## Troubleshooting

| Symptom | First checks |
| --- | --- |
| Old video/design visible | Actual loaded asset URLs, deployment status, cache, branch/host |
| Local works, Pages assets fail | assetPath, NEXT_PUBLIC_BASE_PATH, filename case and export config |
| currentTime changed but screenshot stale | Wait for decoded frame presentation; inspect seeking/readyState |
| Film freezes/falls back | Network ranges, timeouts, media error, codec and keyframes |
| Plain section backgrounds return | section-shell/continuation/footer CSS and old theme rules |
| Final frame leaves with pinned section | Stage placement and transformed ancestors |
| Text covers new subjects | Chapter position, object-position and actual scene timing |
| Opening remains after intro | Timeline visibility, fallback styles, refresh and cleanup |
| Page keeps moving under an open dialog | Lenis stop/start observer and data-lenis-prevent |
| Anchor lands at the wrong offset or jitters | Lenis anchors option was enabled, or scroll-behavior changed |
| Plant stays blurred at the footer | .stage-focus fade tied to #closing; check ScrollTrigger refresh |
| Pages build fails at npm ci | Lockfile written by a newer local npm; compare against the last working lockfile and test with npx npm@10 ci --dry-run |
| git push hangs or asks for a username | Git Credential Manager needs an interactive GitHub sign-in by the user |
| Browser test cannot launch | Chrome availability or deliberate Playwright channel configuration |
| Optimizer cannot find source | Fresh clones contain optimized film only; locate local master |

## Optional future work

There is no active implementation backlog. If requested, useful work could include physical iOS/Safari and Android testing, a focused accessibility review, factual copy from Dalmia's own reports, a film-grain overlay, or a 1080p version of the current film if the user produces one. These possibilities do not authorize scope expansion.

## Finish the handoff

Standing user instruction (2026-09-29): Keep all six Markdown files in plan/ current whenever this project changes, including small changes. Before finishing a task, review all six, update every affected document, and record the change, checks actually run, and remaining limitations in 04_IMPLEMENTATION_STATUS.md. Do this automatically without waiting for a reminder. Preserve accurate unchanged facts; do not invent changes or validation results.

Include deployment identity when applicable. Keep the application commit and its historical validation separate from the documentation update date.

For documentation-only changes, verify filenames, links and facts against source. Rebuilding the unchanged application is unnecessary. Never invent validation results, company facts or future commitments.
