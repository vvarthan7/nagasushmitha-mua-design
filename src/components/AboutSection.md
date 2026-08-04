# About section — option 2A · handoff

`AboutSection.jsx` + `AboutSection.css` → `src/components/AboutSection/`.
Numbered 01/02/03 markers removed; the three beats are now a hairline list.

```jsx
import HeroReel from "./components/HeroReel/HeroReel";
import AboutSection from "./components/AboutSection/AboutSection";

<HeroReel />
<AboutSection />   // sits directly under the reel
```

Props (all optional): `image`, `imageAlt`, `eyebrow`, `ctaLabel`, `ctaHref`
(defaults to `/about`).

## Image

Put the portrait at `public/images/about/nagasushmitha.jpg`.

The arch is 3:4 but the source is a tall 2:3 full-body frame, so it crops. The
CSS sets `object-position: 55% 16%` — that holds her face and the rose in the
upper half of the arch. If you swap the photo, that value is the first thing to
retune. Export ~1200px wide, quality 75.

## Copy

The three beats live in the `BEATS` array at the top of the JSX — edit there, not
in the markup. Copy is the Evolution / Reach / Vibe text as supplied. Two
substitutions worth making when you have the real detail:

- "elite masterclasses with international beauty icons" → name the mentors.
- "thousands of clients every year" → a real figure reads far stronger.

## Structure notes

- Beats are a `<dl>` (`dt` label / `dd` body) — correct semantics for
  term-and-description pairs, and it reads properly to screen readers.
- The `<h2>` is the section heading, tied to the section via `aria-labelledby`.
  If this ends up being the page's only heading below the hero `<h1>`, leave it
  at `h2`.
- The offset outline is a decorative `<span>`, `aria-hidden`.
- Ken Burns push is 26s, disabled under `prefers-reduced-motion`.

## Breakpoints

- **≤980px** — single column, portrait capped at 420px.
- **≤560px** — outer border and offset outline drop, CTA goes full width.

## Fonts

Playfair Display 400 (heading), Manrope 400/600/700 (everything else). Already
loaded site-wide.
