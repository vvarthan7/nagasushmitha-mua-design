# Banner 1C — "Reel" · handoff

Two files: `HeroReel.jsx`, `HeroReel.css`. Drop both into `src/components/HeroReel/`.

```jsx
import HeroReel from "./components/HeroReel/HeroReel";

<HeroReel />                       // defaults
<HeroReel name="Sushmitha" kicker="Bridal · Editorial · Academy" height={680} />
```

## Images

Four frames, in `heroReelFrames` in `src/data.js`:

| slot | file | size | focal point |
|---|---|---|---|
| 1 | `bridal/IMG_3894.webp` | 1333×2000 | `50% 39%` |
| 2 | `bridal/0K4A3042.webp` | 8088×5395 | `50% 16%` (mobile `76% 16%`) |
| 3 | `bridal/IMG_3877.webp` | 1333×2000 | `50% 32%` |
| 4 | `bridal/IMG_3892.webp` | 1333×2000 | `40% 40%` |

Edit that array to change files, focal points, or alt text.

**Only one axis of each pair is ever live.** Desktop is width-driven, so Y
picks the band and X is inert; below 860px it flips. Slot 4's `40%` therefore
does nothing on desktop, and every `mobilePosition` Y does nothing anywhere.
The `position` X survives only as the fallback when `mobilePosition` is absent.

The Y values are tuned against a **700px** banner. Change `height` and they need
re-checking — a deeper band shifts what the same percentage frames. The portrait
sources are the tight ones: at 1920px wide only ~24% of the photo is on screen,
which is less than the distance from hairline to chin, so something is always
cut. Slot 4 is the outlier at `40%` because its subject sits much lower in the
source than the other three.

Ken Burns then pushes in a further ~9%, so keep the subject well off the edges.

Export each at ~2000px on the long edge, quality 72–78, and preload the first:

```html
<link rel="preload" as="image" href="/src/assets/bridal/IMG_3894.webp" />
```

**Watermarks:** slots 1, 3 and 4 carry a "Classy Captures" badge and slot 2 a
"Stories by Rg" mark, all in the bottom-right ~80–94% across, ~87–94% down.
Desktop never reaches that far down the photo, so they are invisible there. On
mobile the full height is in frame and the badge corner can clip in at the right
edge. Cropping it out of the source files is the only real fix — no
`background-position` value hides it, because the visible column is wider than
the gap between the badge and the frame edge.

## Timing

24s cycle, four frames. Each frame holds ~18% of the cycle and dissolves over
~7%. To change speed, edit `animation-duration: 24s` in `.frame1..4` — all four
must match or the frames desync. Keyframe percentages stay as they are.

Each frame also carries its own Ken Burns push (`hr-burns-1..4`), aligned to the
window where that frame is actually visible. Do **not** collapse these back into
one shared set: a single one-way push is not loop-continuous, and because some
frame is always on screen at the wrap, the reset shows as a jump. Frame 1's
window straddles the loop boundary, so its `0%`/`100%` value is pinned mid-push
and has to be recomputed if the windows or the scale range change.

## Swapping in real video

Replace the `.hero-reel__frames` block with:

```jsx
<video className="hero-reel__frames" autoPlay muted loop playsInline
       poster="/images/hero/look-01.jpg">
  <source src="/video/hero.webm" type="video/webm" />
  <source src="/video/hero.mp4" type="video/mp4" />
</video>
```

and add `object-fit: cover; width: 100%; height: 100%;` to `.hero-reel__frames`.
Wordmark and the reduced-motion rule still apply. Keep the file under ~4 MB and
gate it behind a `(min-width: 861px)` check so phones get the poster instead.

## Accessibility / perf notes

- Frames are `role="img"` with alt text; the `<h1>` is the real heading.
- `prefers-reduced-motion` freezes on frame 1 — already handled.
- The `IntersectionObserver` pauses the cycle off-screen. Remove it if the
  banner is always above the fold anyway.
- Contrast: one light `.scrim` over the frames, much weaker than the original
  (0.12 through the middle against the old 0.34, which was flattening the
  photography). The centre radial vignette is gone for good. The wordmark still
  carries most of its own contrast through the two-layer `text-shadow` on
  `.name` / `.kicker` — the scrim only assists.
- The scrim's 0.34 top stop belongs to the **nav**, not to this component. The
  bar paints no background of its own over the banner, so that stop is the only
  thing behind its white links and logo. Lowering it makes the nav go soft. If
  you re-crop or replace a frame, check the wordmark *and* the nav links against
  it — frame 2 is the bright one.

## Fonts

Playfair Display 400 (wordmark), Manrope 400/600 (kicker). Already loaded
site-wide — no extra `<link>` needed.
