# Business logic and interaction behavior

Updated: 2026-10-01. This demo has presentation interactions rather than transactional business logic.

## Content/navigation contract

| UI / action | Destination or outcome |
| --- | --- |
| Brand logo / Back to beginning | #cinematic |
| About / Skip intro / Explore Dalmia | #about |
| Businesses / Discover our world | #our-world |
| Sustainability | #sustainability, the corresponding Our World panel |
| Closing | #closing, followed by its footer |
| Menu button | Opens #main-menu native dialog |
| Watch Film | Native-control film dialog using the same MP4 |

Our World panels do not lead to additional business pages. Anchors use a 98px scroll margin except #cinematic. Menu navigation closes the dialog, restores scrolling and updates the hash. Native dialogs and focus restoration support keyboard navigation.

## Smooth scrolling

smooth-scroll.tsx creates one Lenis instance (lerp 0.11, wheelMultiplier 0.9), advanced by gsap.ticker and reporting to ScrollTrigger.update. It smooths mouse-wheel input only. Touch scrolling, keyboard scrolling, anchor links, scrollIntoView and window.scrollTo remain native, and Lenis re-syncs to them, so existing navigation code and scroll-margin offsets are unchanged. Lenis's anchors option is deliberately off: it does not cancel the browser's own hash navigation, so the two would fight.

Both dialogs carry data-lenis-prevent, and a MutationObserver on their open attribute calls lenis.stop()/start() so a glide in progress cannot continue beneath an open dialog. Lenis respects prefers-reduced-motion itself. The film scrub (0.55 s) is applied on top of the wheel smoothing.

## Film initialization

Source: /videos/cementing-a-nation-v3-720p.mp4 through assetPath. Every device uses this URL. The background video is muted, playsInline, unfocusable and initially preload=none without src. The effect assigns src/preload=auto for animation. Reduced-motion visitors do not automatically download the MP4.

Actual duration is read from metadata/readiness events. Current duration: 30.041667 seconds (721 frames at 24 fps). data-quality is 720p. data-mode, data-ready, data-quality, data-duration and data-chapter provide diagnostics, not user-facing content.

## Scroll-to-time mapping

ScrollTrigger id: dalmia-film. Start: top top. Pin distance: innerHeight × 3.5 (350vh). Scrub: 0.55 seconds. Viewport refresh invalidates measurements.

```text
lastFrameTime = max(0, actualVideoDuration - 1 / 24)
targetTime = min(progress / 0.84, 1) × lastFrameTime
```

The first 84% traverses the entire film; the last 16% holds its last frame. The 1/24 subtraction matches the current source's 24 fps. Duration is automatic, but frame-rate assumptions and editorial timings require review for another source.

A requestAnimationFrame queue assigns currentTime with at most one seek in flight. New input replaces the target instead of queuing stale seeks. seeked schedules the latest target. Differences below 0.025 seconds are ignored. React state is not updated per animation frame.

Forward scrolling advances; reverse scrolling seeks backward. The background video stays paused. Do not add autoplay to the scrub video.

## Current chapter timeline

Values are fractions of pinned scroll progress, not video seconds.

| Event | Progress |
| --- | --- |
| Chapter 01 button target | 0.08 |
| Opening art fade out | 0.012–0.082 |
| Chapter 01 fade out | 0.235–0.285 |
| Chapter 02 button target | 0.46 |
| Chapter 02 fade in | 0.335–0.39 |
| Chapter 02 fade out | 0.55–0.59 |
| Chapter 03 fade in | 0.625–0.67 |
| Chapter 03 button target | 0.73 |
| Chapter 03 fade out | 0.735–0.785 |
| Finale fade in | 0.81–0.875 |
| Final frame reached | 0.84 |
| Bottom controls fade out | 0.96–0.995 |

Chapter text:

- 1904 — A Vision Takes Form.
- MID-1930s — One Stone Changed Everything.
- 1939 — Industry Rose. Communities Grew.

The active indicator changes at 0.30 and 0.61. The finale becomes interactive at progress >=0.82. inert and aria-hidden prevent hidden content receiving interactions. The Scroll to Explore control advances to a later chapter, then to the finale/next section.

Timings follow the 720p film, where film time is roughly progress / 0.84 × 30 seconds: the statue assembles and is circled from 0 to about 9.5 s, the camera drops to the railway at 10–12 s, the stone is on screen from 13 to 19.5 s, the line runs across the empty plain from 20 to 24 s, and the plant and houses rise from 25 s to the end. The stone chapter's button lands near 16.4 s. The industry text enters near 22.3 s over the empty plain so the plant rises beneath it, and its button lands near 26.1 s. Timings for the earlier 12-second and 29.67-second films are obsolete.

## Architectural prologue

Markup/animation live in cinematic.tsx; CSS uses .opening-* selectors. It contains formwork outlines, construction guides, a red origin marker and a minimal caption.

Strokes draw over 2.2 seconds with a 0.16-second stagger; the caption fades in. This finite entrance uses wall-clock time. The parent fades from progress 0.012 to 0.082 (the statue now starts assembling within the first second), translating upward and scaling slightly. Opacity returns when scrolling back, but the one-time drawing is not restarted by each reverse scroll.

Fine-pointer desktop movement uses GSAP quickTo with 1.1-second easing and small translation/rotation. It runs only at widths >=768px, before progress 0.13 and with no open dialog. Pointer leave resets the target. The art is aria-hidden and pointer-events:none. Reduced motion and video fallback hide it. No canvas, dust, fog, clouds or WebGL effect remains.

## Finale and continuation

The fixed stage is outside the pinned overlay. After the pin ends, it retains the decoded final frame behind About, Our World, Closing and the footer. A continuation scrim and text shadows provide contrast without opaque section backgrounds. Returning upward restores reverse scrubbing.

Reveals applies one-time y/opacity entry animation. With motion allowed on any device it also runs a rack focus on the held frame: .stage-focus-image fades in from #our-world top 85% to top 30%, then its parent .stage-focus fades out from #closing top 90% to top 30%. On fine-pointer, hover-capable desktops >=1024px, it adds perspective heading entry, independent image parallax/tilt, pointer drift and one scrubbed camera timeline on .stage-media: push in to scale 1.15 (xPercent 2, yPercent 1.5) until #closing reaches the viewport bottom, then pull back to 1.03. The turn point is measured once from #closing.offsetTop when the effect is created.

header.tsx watches .continuation with an IntersectionObserver (top 16% of the viewport) and sets data-surface to content or film on the header. GSAP contexts and listeners are cleaned up when effects revert.

## Recovery and accessibility

Reduced motion, video error, unsupported MP4, a 14-second loading timeout or a seek stuck for 3.5 seconds activate fallback. It stops seeking, kills the pin/timeline, shows the static finale and keeps Explore Dalmia available. No-JavaScript styles reveal the static finale and hide nonfunctional controls.

Watch Film is a mobile/fallback alternative using the same URL. It requests playback on opening; if play fails, native controls remain available. Closing pauses playback, restores scrolling and returns focus. The header menu uses a native dialog, Escape support, body scroll locking and focus restoration.

See [architecture](01_SYSTEM_ARCHITECTURE.md) for ownership and [continuation procedures](05_MULTI_ROLE_NEXT_STEPS.md) for safe changes.
