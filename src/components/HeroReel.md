# Banner 1C — "Reel" · handoff

Two files: `HeroReel.jsx`, `HeroReel.css`. Drop both into `src/components/HeroReel/`.

```jsx
import HeroReel from "./components/HeroReel/HeroReel";

<HeroReel />                       // defaults
<HeroReel name="Sushmitha" kicker="Bridal · Editorial · Academy" height={680} />
```

## Images

Four frames, referenced from `public/images/hero/`:

| slot | file | focal point |
|---|---|---|
| 1 | `look-01.jpg` | `62% 38%` |
| 2 | `look-02.jpg` | `center` |
| 3 | `look-03.jpg` | `50% 30%` |
| 4 | `look-04.jpg` | `46% 42%` |

Edit the `FRAMES` array to change files, focal points, or alt text. The
`backgroundPosition` values matter — the Ken Burns push crops in ~16%, so a
face near the frame edge will drift out. Shoot or crop these **vertical-safe**:
subject in the middle 60%.

Export each at ~2000px on the long edge, quality 72–78, and preload the first:

```html
<link rel="preload" as="image" href="/images/hero/look-01.jpg" />
```

## Timing

24s cycle, four frames. Each frame holds ~18% of the cycle and dissolves over
~7%. To change speed, edit `animation-duration: 24s` in `.hero-reel__frame--1..4`
— all four must match or the frames desync. Keyframe percentages stay as they are.

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
Scrims, wordmark, and the reduced-motion rule all still apply. Keep the file
under ~4 MB and gate it behind a `(min-width: 861px)` check so phones get the
poster instead.

## Accessibility / perf notes

- Frames are `role="img"` with alt text; the `<h1>` is the real heading.
- `prefers-reduced-motion` freezes on frame 1 — already handled.
- The `IntersectionObserver` pauses the cycle off-screen. Remove it if the
  banner is always above the fold anyway.
- Contrast: the vertical scrim alone wasn't enough on the lighter frames, hence
  the centre radial. Don't delete `.hero-reel__vignette` without re-checking the
  wordmark against frames 2 and 3.

## Fonts

Playfair Display 400 (wordmark), Manrope 400/600 (kicker). Already loaded
site-wide — no extra `<link>` needed.
