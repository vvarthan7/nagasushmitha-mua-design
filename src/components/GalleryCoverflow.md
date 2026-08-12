# GalleryCoverflow

Hero frame at centre, neighbours shrunk, blurred and veiled, everything sliding
through the middle. Arrows, clicking a side frame, dragging, and ← / → move the
ring; the category buttons swap the ring for a different set of photos; the
centre frame opens the full-screen viewer.

Three components, all in the one file: the section, the `<Ring>` it renders
(twice during a set swap), and the `<Viewer>` overlay — which is the same ring
again, on a dark ground.

## Install

```
src/components/GalleryCoverflow.jsx
src/components/GalleryCoverflow.module.css
src/hooks/useDragStep.js
```

```jsx
import GalleryCoverflow from "./components/GalleryCoverflow.jsx";

<GalleryCoverflow />
```

No dependencies beyond React and `src/data.js`. Palette, easing and the pill
primitive come from `styles/global.css` and `styles/shared.module.css`; fonts
(Manrope 400/600/700, Playfair Display 400 + 400 italic) are loaded globally.

## Props

| prop | default | notes |
| --- | --- | --- |
| `categories` | `galleryFilters` | Which sets get a button, in order. |
| `defaultCategory` | first filter (`"Bridal"`) | The set shown on load. |
| `eyebrow` | `"Gallery"` | Small caps line above the title. |
| `heading` / `headingAccent` | `"Look by"` / `"look"` | Accent renders in plum italic. |
| `lead` | range sentence | Keep under ~2 lines. |
| `ctaLabel` / `ctaHref` | `"View more"` / `"#"` | Sits at the end of the button row. Point it at a gallery route when there is one. |

## Photos

Folder-driven through `data.js`: drop a file into `src/assets/bridal` or
`src/assets/editorial` and it joins that set, ordered by filename. `MAX_SHOTS`
(10) caps each set — five cards are on screen at once, so past ten the extra
frames are payload nobody swipes to. Entries may carry an optional `position`
(the card's `background-position`); cards are ~3:4, so a face off-centre wants
its own value (`"60% 34%"`).

Export at ~900px on the long edge, ~120 KB each. Originals from the shoot
folder are 3–11 MB; shipping those makes this a ~40 MB first paint.

## Category buttons vs. the ring

The row is three controls: one button per category plus the CTA link. They
select a **set**, not a photo — moving the ring with arrows, drag or keys never
changes which button is lit, so the highlight always answers "which gallery am
I in".

Swapping sets cross-fades two rings rather than fading one out and the next
in — fading a single ring leaves the stage blank for a beat, with the arrows
stranded under 480px of nothing.

So `<Ring>` is its own component and there are briefly two of them. Clicking a
category moves the live ring to the new set and parks the old one in `leaving`,
along with the index it was left on; `SWAP_MS` later the effect drops it. The
incoming layer runs `layerIn` (fade up, sliding in from `--dir × 56px`), the
outgoing runs `layerOut` (fade down, sliding the other way), both `0.46s`. They
overlap the whole way, so there is always something on the stage.

`--dir` is set per layer from the button order: Editorial sits right of Bridal,
so choosing it pushes in from the right and Bridal leaves left. Choosing Bridal
from Editorial reverses both.

The outgoing layer is `aria-hidden`, `pointer-events: none` and untabbable — it
is a ghost, and must not swallow clicks meant for the ring arriving underneath
it.

`SWAP_MS` (460) and the two animation durations are the same number in two
files; change one and change the other, or the old set will vanish mid-fade.

## How the ring works

The DOM holds `laps × shots.length` cards (`laps = max(2, ceil(15 / n))`), so
five photos become a 15-slot ring and ten become 20. Two consequences worth
keeping:

- Because the ring length is a **multiple** of `shots.length`, any five
  neighbouring slots are five different photos — nothing repeats on screen.
- Cards at slot |4| or beyond are invisible **and** have `transition: none`, so
  the wrap from one end to the other teleports instead of sweeping across the
  frame. Removing either the opacity cut or the transition cut brings the sweep
  back.

`index` grows unbounded and direction comes from the sign of the step, so
travelling from the last photo to the first still slides forward.

Tuning: `SIDES` (2 cards either side, which the viewer overrides to 1) and
`MAX_SHOTS` are constants at the top of the JSX. The sizes are CSS variables on the stage — `--card-w`,
`--card-h` and `--slot`, the pitch between neighbours, which the card transform
multiplies by its slot offset. They live in CSS because the viewer runs bigger
frames than the page (420×560 against 320×430) and both come down at the
breakpoints. Keep `--slot` under `--card-w` or the frames stop overlapping and
the coverflow reads as a plain row.

## The viewer

Clicking the **centre** frame opens `<Viewer>` — the same `<Ring>`, full
screen on a dark ground. Side frames keep their old job of travelling to
centre, which is why only the centre card gets `cursor: zoom-in`; move the
`opens` test in `Ring` if you would rather any frame opened it.

The overlay drops the category buttons — you are already inside a set — and
shows one frame either side of the centre rather than the page's two, its
frames being large enough that a second pair only crowds them (`sides={1}` on
the ring). Under the frames, arrows and dots sit on one line and read as a
single control: step either side, jump in the middle. The active dot stretches
to a bar, so position reads without relying on colour alone. The `View all` CTA
takes `ctaHref` from the section, so both links stay one value.

It is portalled to `<body>`: `.section` is `overflow: hidden`, and a portal
also puts the overlay past the nav (z-index 30) and the WhatsApp button (40)
without a stacking-context argument. It sits at 60, the same layer as
`Lightbox`.

Housekeeping the overlay does: locks body scroll, closes on Escape or a scrim
click, travels on ← / →, focuses the panel on open and hands focus back to the
frame that opened it on close. The viewer keeps its own `index`, so closing
leaves the page ring exactly where you left it.

## Not included

- Autoplay — add a `setInterval` on `step(1)` with a hover pause if you want it.
- Pinch zoom in the viewer; frames are `background-image`, so a real zoom means
  swapping the centre card for an `<img>`.
