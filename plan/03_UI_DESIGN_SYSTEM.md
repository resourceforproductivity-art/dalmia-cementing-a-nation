# UI design system

Updated: 2026-10-01. Source: [globals.css](../src/app/globals.css), [page.tsx](../src/app/page.tsx), [cinematic.tsx](../src/components/cinematic.tsx).

## Visual intent

A cinematic architectural presentation with monumental editorial type, open spacing, restrained linework and spatial depth around the supplied film. Keep the composition and copy minimal. This is a presentation demo, not an official corporate website or complete brand system.

The original brief's off-white sections were superseded: all content and the footer now sit over the final video frame. Generated dust/cloud effects were explicitly removed. These are current decisions, not missing features.

## Palette

| Token / use | Value |
| --- | --- |
| --paper / primary type | #f2f0eb |
| --ink | #252c2e |
| --muted | #ccc9c1 |
| --red | #c5473c |
| Charcoal theme token | #202729 |
| Body/stage background | #101b1f |
| Warm display emphasis | #d9cdb7; #e3d6c0 in cinematic type |
| Opening linework | #e9e3d9 at varied opacities |
| Opening red datum | #c55b4d |

Red is limited to markers, rules and hover accents. Existing gradients are contrast scrims/vignettes over imagery. Avoid decorative random gradients, glass surfaces, luminous beams and particle textures.

## Typography

Display: local Cormorant Garamond 400 and 400 italic. Body/navigation: local Manrope Variable. The editorial serif and italic emphasis are intentional.

| Element | Desktop scale / treatment |
| --- | --- |
| Chapter year | Large fluid serif with chapter-specific clamp overrides; font-variant-numeric: lining-nums, because Cormorant's default old-style figures made 1904 read like I9O4 |
| Finale | clamp(84px, 11.8vw, 208px), tight two-line composition |
| About heading | clamp(68px, 8.7vw, 150px), line-height .91 |
| Our World heading | clamp(56px, 6.4vw, 110px), line-height .95 |
| Closing heading | clamp(64px, 9.45vw, 165px), line-height .91 |
| Body | Typically 16px with generous line-height |
| Navigation | 14px desktop; compact mobile labels |
| Eyebrows | Small uppercase, tracked, restrained |

Mobile uses smaller clamps and removes the large horizontal italic indent. Several rules have later presentation refinements in globals.css. Inspect the cascade before editing an earlier rule that is overridden below it.

## Composition

Shared gutter: clamp(24px, 5.6vw, 112px), with wide-screen treatment above 1800px. Sections use .section-shell and transparent backgrounds.

- Header: fixed white logo/navigation above the film. Desktop links plus menu; mobile hides inline links. Its theme remains dark throughout. Over the film it has only a gradient; once editorial content scrolls beneath it, a dark blurred backing (masked to fade out at the bottom, no hard edge or border) keeps text from reading through the logo.
- Cinematic: full-screen cover video, HTML chapter type, right chapter rail and bottom controls.
- Opening art: perspective outlines occupy the empty left landscape, balanced against 1904 on the right. A short caption sits below. The drawing clears early as the statue appears.
- Chapter 01: right side, leaving the central figure clear. Chapter 02: also right side at a smaller scale, because the stone sits left of centre and grows toward the left. Chapter 03: left side, entering over the empty plain before the plant rises along the horizon.
- The 720p film is a bright daylit desert. Chapter years and headings carry a soft text shadow, and a side scrim darkens whichever edge holds the type (right for chapter 2, left from chapter 3 on). The scrim is off below 768px, where the bottom vignette does the work.
- About: Building Beyond Cement, inset italic emphasis, one film still with fine corner details and restrained copy.
- Our World: staggered image-led panels for Cement, Innovation and Sustainability. Avoid turning these into a generic service-card catalog.
- Closing: Building a Stronger Tomorrow, restrained red accent and simple footer over the held frame.

Use local official imagery and the existing logo. Asset origins are in README.md. Do not invent statistics, partner marks or archival labels.

## Responsive behavior

| Condition | Treatment |
| --- | --- |
| <=1100px | Tighter spacing and panel gaps |
| <=767px | Single-column content, compact menu/type, Watch Film visible |
| >=768px | Desktop chapter positioning; fine-pointer opening parallax |
| >=1024px + hover/fine pointer | Full continuation camera/hover effects |
| Desktop height <=720px | Compact cinematic type and controls |
| prefers-reduced-motion | Static finale; no pin, opening drawing or animated camera |

Mobile opening art uses a compact 32%-height region above chapter type and omits its secondary caption. Video object-position varies by chapter: default 47% (so the assembling statue is in frame), stone 50%, industry/fallback 45%. Review actual subjects before changing this.

Reviewed widths include 320, 390, 820 and 1440 pixels. Desktop presentation viewport: 1440×900. Physical-device testing remains useful when available.

## Motion vocabulary

Use finite, purposeful motion: line drawing, chapter fades, small depth differences, subtle tilt and smooth anchors. The opening uses SVG/CSS/GSAP, not a 3D engine or persistent rendering loop.

Wheel scrolling is weighted by Lenis. The held final frame behaves like a camera: sharp behind About, defocused and slightly darker behind the Our World panels so the photographs become the subject, sharp again for Closing, with a slow desktop push-in toward the kiln tower followed by a pull-back to the whole plant. The defocus keeps the photographs as the subject over a busy daylit frame. This is a blurred copy of the same frame, not a generated haze, particle or fog effect.

Background and foreground move independently in the continuation. Avoid competing transforms on one element. Motion must not be essential to reading or navigation. Keep hidden content inert and decorative layers noninteractive.

## Visual acceptance

The initial scene needs a clear focal balance before the statue appears. Outlines must clear as the film takes over. Type must remain readable and avoid subjects, rails and the header. Inspect a decoded frame after seeking settles: currentTime can update before a screenshot captures the presented frame.

At the finale and footer, the same final image must remain continuous. No opaque white/charcoal panel should cover it. The plant should be sharp at About and at the footer, and soft only behind Our World. Pointer movement should feel controlled. Confirm that generated haze/dust has not returned.

For current implementation evidence, see [status](04_IMPLEMENTATION_STATUS.md).
