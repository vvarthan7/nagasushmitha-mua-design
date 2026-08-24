# Design System — Naga Sushmitha

The vocabulary this site is built from: the tokens, the type and colour
decisions that repeat, and the rules that keep a new section looking like it
belongs. It documents what is in the code today — every value here is one you
can find in [src/styles/tailwind.css](src/styles/tailwind.css) or a component.

**Single source of truth is `@theme` in
[src/styles/tailwind.css](src/styles/tailwind.css).** Tailwind v4 turns each
entry there into a utility: `--color-plum` gives `bg-plum` / `text-plum` /
`border-plum`, `--ease-brand` gives `ease-brand`, `--animate-marquee` gives
`animate-marquee`. Add a token there, not in a component.

---

## 1. Character

Bridal, warm, photographic. Three things carry it:

- **Photography is the loudest element.** Chrome gets out of its way — the nav
  paints nothing over the banner, the hero scrim is deliberately light, and
  overlays on images are the exception rather than the default.
- **Warm neutrals, never grey.** Every neutral in the palette is tinted plum or
  clay. There is no `#000`, no `#888`, and shadows are tinted too.
- **Small type carries the structure.** Section identity comes from a 10px
  wide-tracked uppercase eyebrow above a serif heading, not from heavy rules or
  boxes.

---

## 2. Colour

No dark mode. "Dark" here is a *section treatment* (`bg-ink`), not a theme — a
handful of bands invert, and they have their own token set.

### Light surfaces

| Token | Hex | Role |
| --- | --- | --- |
| `white` | `#ffffff` | Page ground, cards on tinted bands |
| `blush-soft` | `#fbeee8` | Lightest tint band (marquee, BeforeAfter, Services panel) |
| `blush` | `#f5e2d9` | Stronger tint band (About, BookingSteps, FAQ), image placeholders |
| `border-soft` | `#f0dcd4` | Hairlines on white |
| `border-faq` | `#eacfc4` | Hairlines on `blush` — a step darker so they survive the tint |
| `border` | `#e6bfb2` | Visible outlines: chips, arrow buttons, underlines |

Adjacent bands must not repeat the same fill. `AboutSection` uses `blush`
specifically because the `Marquee` above it is already `blush-soft` and the two
would read as one band.

### Ink and brand

| Token | Hex | Role |
| --- | --- | --- |
| `ink` | `#2c1a1c` | Headings, dark section ground, all shadow tints |
| `plum` | `#7d3646` | Primary brand. Default link colour, primary fills, active states |
| `rust` | `#b0543f` | Accent. Eyebrows, link hover, small directional labels |
| `clay` | `#d99a86` | Warm accent. Numerals, decorative outlines, accent on dark |

### Text

| Token | Hex | Role |
| --- | --- | --- |
| `ink` | `#2c1a1c` | Headings and bold labels |
| `text` | `#6b4a48` | Body copy |
| `text-muted` | `#7a5a56` | Secondary / inactive controls (nav links when solid) |
| `meta` | `#a98a83` | Captions, placeholders |
| `dot` | `#e0b1a4` | Inactive carousel dots |

### Dark sections

Used by `Enquire` and the gallery viewer overlay. Do not reach for the light
text tokens inside a dark band — contrast is set by this group.

| Token | Hex | Role |
| --- | --- | --- |
| `field` | `#3a2124` | Input fill, panel fill on ink |
| `field-border` | `#4a2e31` | Input and ghost-button borders |
| `on-dark` | `#d6bdb8` | Body copy on ink |
| `on-dark-strong` | `#f0d9d3` | Links and emphasised copy on ink |
| `footer-text` | `#9c807d` | Footer meta |
| `footer-border` | `#3f2529` | Footer rule |
| `academy-border` | `#b07a80` | Ghost-button and viewer outlines on ink |

### Pairing rules

- Eyebrow is `rust` on light, `clay` on dark.
- `<em>` inside a heading takes `plum` on light, `clay` on dark — the pattern is
  `[&_em]:text-plum` on the `h2` rather than a span in the copy.
- Never put `plum` on `ink`, or `rust` on `blush` at body size. Both are
  legible only as large or wide-tracked type.
- Over photography, colour cannot carry a state — use white, opacity and
  shadow. See §9.

---

## 3. Typography

Two self-hosted families, subset to woff2 in
[src/assets/fonts/](src/assets/fonts/) and declared in
[src/styles/fonts.css](src/styles/fonts.css). No third-party font requests at
runtime.

- **`font-serif`** — `"Playfair Display", Georgia, serif`. Headings, pull
  quotes, step numerals. Always `font-normal`; weight is never used to add
  emphasis, size and italic are.
- **`font-sans`** — `Manrope, system-ui, sans-serif`. Everything else. Set on
  `body`, but stated explicitly on components anyway so a block can be read
  without tracing inheritance.

### Scale

Headings are fluid; everything below heading size is fixed, because tracking
and size are tuned together at small sizes and a clamp would break the pairing.

| Role | Value | Notes |
| --- | --- | --- |
| Banner name (`h1`) | `clamp(38px,6vw,76px)` serif, `leading-1.05`, `tracking-[-0.01em]` | One per page |
| Section heading, primary | `clamp(26px,4vw,38px)` serif | Services, BookingSteps, Enquire |
| Section heading, paired with body | `clamp(24px,3.6vw,34px)` serif, `leading-1.15` | FAQ, BeforeAfter |
| Section heading, hero-adjacent | `clamp(30px,3.4vw,46px)` serif, `leading-1.12` | About only |
| Section heading, minor | `clamp(22px,3.4vw,32px)` serif | Instagram |
| Sub-heading (`h3`) | `clamp(22px,3.2vw,30px)` serif | Inside a panel |
| Pull quote | `clamp(19px,2.8vw,28px)` serif italic, `leading-1.55` | Testimonials |
| Numeral | `clamp(28px,4vw,34px)` serif italic, `clay` | BookingSteps cards |
| Body | `14px`, `leading-1.8` | Default paragraph |
| Body, dense | `13px`, `leading-1.7`–`1.8` | Cards, FAQ answers |
| Card title | `14px` sans `font-bold` | Not serif — cards stay sans |

### Small caps set

Everything uppercase is sans, wide-tracked, and 10–12px. The tracking is what
distinguishes the roles, so keep these pairings:

| Role | Size / weight | Tracking |
| --- | --- | --- |
| Eyebrow | `10px` regular | `0.26em` |
| Button / CTA label | `11px` semibold | `0.14em` |
| Nav link | `12px` bold | `0.14em` |
| Chip, tab, tag | `10px` semibold | `0.14em` (tags `0.1em`) |
| Inline link ("Enquire about this") | `10px` semibold | `0.14em` |
| Attribution name | `11px` | `0.18em` |
| Meta / footer | `10px` | `0.12em`–`0.14em` |
| Marquee | `clamp(9px,1.2vw,11px)` | `0.28em` |
| Banner kicker | `15px` bold | `0.34em` (`0.24em` below 860px) |

### Measure

Every paragraph gets an explicit `ch` cap — `max-w-[42ch]` to `max-w-[52ch]`
depending on density — plus `text-pretty`. Headings that wrap get
`text-balance` or `text-pretty`. A paragraph with no measure cap in a wide grid
column is a bug.

---

## 4. Layout

Three tokens replace numbers that were repeated across nine, twelve and eight
places:

| Token | Value | Utility |
| --- | --- | --- |
| `--container-shell` | `1240px` | `max-w-shell` |
| `--spacing-gutter` | `clamp(18px,4vw,44px)` | `px-gutter` |
| `--spacing-nav-offset` | `90px` | `scroll-mt-nav-offset` |

### The section band

Two shapes, and almost every section is one of them.

**Full-bleed background, contained content** — when the section has a fill:

```tsx
<section id="how-it-works" className="scroll-mt-nav-offset bg-blush">
  <div className="mx-auto flex max-w-shell flex-col gap-[clamp(20px,3vw,28px)] px-gutter py-[clamp(36px,6vw,64px)]">
```

**Contained directly** — when the section sits on the page white:

```tsx
<section id="services" className="mx-auto flex max-w-shell scroll-mt-nav-offset flex-col gap-[clamp(18px,3vw,26px)] px-gutter py-[clamp(40px,6vw,72px)]">
```

The fill always goes on the outer element and the `max-w-shell` always on the
inner one. Putting the fill on the contained element makes the band stop at
1240px, which is never what is wanted.

### Vertical rhythm

Section padding is fluid on a `6vw` slope:

- Standard band: `py-[clamp(36px,6vw,64px)]` to `py-[clamp(40px,6vw,72px)]`
- Card-in-band (About): `py-[clamp(30px,4.5vw,68px)]` — the card's own padding
  adds to it, so the band's is pulled back

Internal gaps are also fluid, roughly a third of the band's: `clamp(14px,2vw,20px)`
for tight stacks, `clamp(20px,3vw,28px)` for a heading-plus-grid, and
`clamp(22px,4vw,44px)` for a two-column split.

### Grids

Two-column sections are `auto-fit` with a `minmax` floor, never a media query —
they collapse on their own when the floor stops fitting:

```
grid-cols-[repeat(auto-fit,minmax(280px,1fr))]   two-up content split
grid-cols-[repeat(auto-fit,minmax(230px,1fr))]   card row
grid-cols-[repeat(auto-fill,minmax(110px,1fr))]  image tiles (auto-fill: keep the cell size)
```

`auto-fit` for content that should grow to fill the row; `auto-fill` for tile
grids where a stretched last row would look wrong. The one exception is
`AboutSection`, which needs an asymmetric `0.85fr 1.15fr` and so takes an
explicit `upto-980:grid-cols-[1fr]`.

A narrower measure band (`max-w-225`, i.e. 900px) is used for centred single
columns — Testimonials.

---

## 5. Shape

| Radius | Where |
| --- | --- |
| `rounded-full` | Every pill: CTAs, chips, tabs, tags, dots, arrow buttons, single-line inputs, the FAB |
| `rounded-xl` (12px) | Image tiles |
| `rounded-[18px]` | Cards, gallery tiles |
| `rounded-[20px]` | Large panels, textareas |
| `rounded-[clamp(14px,2vw,20px)]` | Media viewers |
| `rounded-[clamp(16px,2vw,24px)]` | Content panels |
| `rounded-[10px]` / `[14px]` | Mobile-tightened variants of the above |

**Arches** are the signature shape — a full radius on the top corners against a
near-square bottom:

```
rounded-[200px_200px_12px_12px]                          portrait (About)
rounded-[clamp(60px,12vw,120px)_clamp(60px,12vw,120px)_10px_10px]   service frame
```

Aspect ratios in use: `aspect-3/4` (portrait), `aspect-4/5` (service frame),
`aspect-5/4` (before/after viewer), `aspect-square` (tiles).

### Elevation

Shadows are tinted, never neutral — plum `rgba(125,54,70,…)` for lifts on light
grounds, ink `rgba(44,26,28,…)` for anything over photography or fixed above the
page.

| Level | Value | Where |
| --- | --- | --- |
| Rest | `0 1px 0 rgba(125,54,70,0.05)` | Card at rest |
| Sticky chrome | `0 6px 26px rgba(125,54,70,0.07)` | Solid nav |
| Raised | `0 18px 36px rgba(125,54,70,0.14)` | Card hover, paired with `-translate-y-1.5` |
| Panel | `0 18px 40px rgba(125,54,70,0.1)` | Mobile nav dropdown |
| Floating | `0 14px 34px rgba(44,26,28,0.3)` | WhatsApp FAB |

Hover states use `inset 0 0 0 1px` box-shadows rather than borders so nothing
reflows on hover.

### Layering

Only four z-indexes exist. Keep it that way; source order handles the rest (the
banner's frames, scrim and wordmark are stacked by order alone, with no z-index
between them).

| `z-30` | Fixed nav |
| --- | --- |
| `z-40` | WhatsApp FAB, controls inside an overlay |
| `z-60` | Full-screen overlays (the gallery-strip and portfolio viewers) |

---

## 6. Motion

Two easings, and the choice between them is not cosmetic:

- **`ease-brand`** — `cubic-bezier(0.2, 0.7, 0.3, 1)`. Movement: transforms,
  layout, entrances, image scale, the nav's collapse.
- **`ease-soft`** — the CSS `ease` keyword. State: colour, background, border,
  shadow. It is deliberately its own token rather than a swap for Tailwind's
  `ease-in-out`, which is a different curve.

Durations, by what is moving:

| Duration | Use |
| --- | --- |
| `250`–`300ms` | Colour and border on a small control |
| `320`–`350ms` | Card lift, dot stretch |
| `400`–`450ms` | Nav palette swap, FAB entrance |
| `600`–`1000ms` | Image scale on hover, overlay reveals |

### Named animations

Declared as `--animate-*` in `@theme`; keyframes live at the top level of
`tailwind.css` (outside `@theme`) so they are always emitted, since several are
only referenced behind a variant.

`marquee` · `about-burns` · `reel-1`…`reel-4` · `hairline` · `layer-in` /
`layer-out` / `layer-fade-in` / `layer-fade-out` · `scrim-in` · `panel-in`

### Reduced motion

Every decorative animation carries `motion-reduce:animate-none`. Where stopping
an animation would leave the element in a broken state, the fallback is
explicit — the banner's frame 1 also takes `motion-reduce:opacity-100` so the
reel freezes on a visible frame rather than on nothing, and the hairline takes
`motion-reduce:scale-x-100` so it does not stay collapsed. The gallery keeps its
cross-dissolve under reduced motion and drops only the travel, so the stage
never blanks.

Long-running animations pause off-screen via an `IntersectionObserver` writing a
`data-paused` attribute the CSS reads (`group-data-[paused=true]:[animation-play-state:paused]`).

---

## 7. Breakpoints

All breakpoints are **max-width and inclusive**, declared in `tailwind.css` as
custom variants rather than written inline:

```
upto-980  upto-900  upto-860  upto-859  upto-560   short (max-h 820)  shorter (max-h 620)
```

Two reasons they are not inline `max-[900px]:` utilities:

1. **Exactness.** `max-[900px]:` compiles to `@media (width < 900px)`, which
   excludes a viewport of exactly 900px. The design's boundaries are inclusive —
   and the nav's dropdown boundary sits exactly at 859/860.
2. **Order.** Tailwind emits custom variants in declaration order, so declaring
   them widest-first reproduces the intended cascade. `900 → short → shorter` is
   the sequence that actually matters; all three set the gallery viewer's stage
   height and the narrowest has to land last.

Names carry the pixel value on purpose — responsive behaviour here is judged by
eye against real widths, and a semantic name would hide the number.

**860px is the layout breakpoint** (nav collapses to a dropdown, the banner
turns portrait). **560px is the tightening pass** — decorative elements drop and
padding contracts. Prefer `auto-fit` grids over adding a new breakpoint.

---

## 8. Components

Only genuinely shared primitives live in [src/styles/ui.ts](src/styles/ui.ts)
as class-name builders. Everything else is a `const` at the top of its own
component file, named in caps, with a comment explaining the values that are not
obvious. That is the house style: **class strings out of JSX, into a named
array, joined**.

```tsx
const CARD = [
  "flex cursor-default flex-col gap-2.25 rounded-[18px] border bg-white",
  "p-[clamp(18px,3vw,24px)] transition-all duration-350 ease-brand",
].join(" ");
```

### Buttons and CTAs

Four variants. All share `rounded-full`, sans, uppercase, `tracking-[0.14em]`.

| Variant | Recipe | Where |
| --- | --- | --- |
| **Primary** | `bg-plum text-white` → `hover:bg-rust` | Nav CTA (solid), FAB |
| **Inverted** | `bg-white text-plum` → `hover:bg-blush` | Over photography |
| **Outline** | `border-clay text-plum` → `hover:border-plum hover:bg-plum hover:text-white` | In-band CTA (About) |
| **Ghost on dark** | `border-field-border text-on-dark-strong` → `hover:border-clay` | Secondary action in Enquire |

Padding runs `px-6 py-3.75` for a standalone CTA, `px-4.75 py-2.25` for the
compact nav one.

### Pill / chip / tag

`pill(on: boolean)` in [src/styles/ui.ts](src/styles/ui.ts) is the only shared
builder — filter chips and service tabs. It is a **branch**, not a base class
plus a modifier (see §10).

```
on:  border-plum bg-plum text-white
off: border-border bg-transparent text-text-muted
```

An inert label is *not* this. Tags use `bg-blush text-plum` with no border and
no pointer, so an unclickable thing never looks like a control.

### Card

`bg-white`, `rounded-[18px]`, `p-[clamp(18px,3vw,24px)]`, `border` with the
colour supplied by state. Rest is `border-transparent` with the 1px rest shadow;
active is `-translate-y-1.5 border-border` with the raised shadow. The border
exists at rest in transparent form so the lift does not change the box size.

### Progress dots

`h-2 rounded-full` (or `h-1.75`), with the active dot stretching into a bar
rather than changing colour alone: `w-2 bg-dot` → `w-6.5 bg-plum`.

### Arrow button

`h-11.5 w-11.5 rounded-full border-border text-plum` →
`hover:border-plum hover:bg-plum hover:text-white`. 46px, comfortably over the
44px touch floor.

### Inline link

A bottom-bordered small-caps label, not an underlined sentence:
`w-fit border-b border-border pb-1` + the 10px semibold uppercase set, in
`plum`. **Must pin its hover colour** — see §10.

### Form field

`border-field-border bg-field text-white px-4.5 py-3.75`, `outline-none` with
`focus:border-clay` carrying the focus state. `rounded-full` for single-line
inputs, `rounded-[20px]` for the textarea. Placeholders double as `aria-label`
where there is no visible label.

### Section header

The repeating three-part opening:

```tsx
<p className="font-sans text-[10px] tracking-[0.26em] text-rust uppercase">How it works</p>
<h2 className="font-serif text-[clamp(26px,4vw,38px)] font-normal text-ink [&_em]:text-plum">
  Three steps to <em>book</em>
</h2>
```

---

## 9. Chrome over photography

The nav is fixed and paints **nothing** over the banner — no tint, no blur, no
border. What separates it from the photograph is the banner's own scrim
(`hero-scrim` in `tailwind.css`), whose top stop (`0.34`) exists for exactly
that. If nav type stops reading, adjust that gradient, not the nav.

The scrim's two numbers are a pair, and each is a budget:

- **`0.34` at the top** is the nav's contrast budget.
- **`0.12` through the middle** is the photography's. It is deliberately about a
  third of what a conventional scrim would carry there; heavier is what flattens
  the frames.

Per-element contrast makes up the difference: the wordmark and nav links carry
their own `text-shadow`, always **two** shadows — a tight one for edge
definition and a wide diffuse one for the light frames. Nav links get a
deliberately lighter pair than they would need on bare photography; stacking a
heavy diffuse shadow on top of the scrim makes small type look smudged.

Once the page scrolls, the whole bar swaps to the light palette in one move via
`data-solid` on the `<header>`, which every child reads with
`group-data-[solid=true]:`. The same flag is forced on when the mobile dropdown
opens, so its links land on the white panel in their dark palette.

Hover over photography uses **white glass**, not a brand colour — plum or rust
go muddy against whatever frame happens to be underneath, while white reads the
same on all four.

---

## 10. Rules

These are the ones that have already caused bugs. They are not style
preferences.

### Branch conflicting utilities, never stack them

Two conflicting classes in one `class` attribute are resolved by their order in
the *generated stylesheet*, not the order you wrote them. So a state that
changes a property the base already sets must be written as a branch:

```tsx
// yes
className={`${DOT} ${active ? "w-6.5 bg-plum" : "w-2 bg-dot"}`}

// no — which width wins is not yours to decide
className={`${DOT} w-2 bg-dot ${active ? "w-6.5 bg-plum" : ""}`}
```

The same applies to `display`: the mobile nav takes
`${menuOpen ? "upto-859:flex" : "upto-859:hidden"}`, never both.

### Pin the hover colour on any anchor styled as a button

The base layer sets `a:hover { color: var(--color-rust) }`. Any `<a>` that is
not a body link must restate its own hover colour, or it will turn rust:

```tsx
"text-white hover:text-white"          // FAB
"text-plum hover:text-plum"            // inline link
"text-on-dark-strong hover:text-on-dark-strong"  // ghost on dark
```

That base rule is gated behind `@media (hover: hover)` to match Tailwind's own
`hover:` variant. Without the gate the two disagree on touch — the base rule
would fire on tap while the pinning utilities would not, which is exactly what
the pins exist to prevent.

### Utilities outrank the base layer

Which is what makes the pinning above work with a plain `hover:text-*` instead
of specificity games. Keep base styles in `@layer base`.

### Every anchor target needs `scroll-mt-nav-offset`

The nav is fixed. Without it an in-page anchor lands underneath the bar.

### Inline styles outrank media queries

A value that a media query needs to override cannot be set inline. Pass it as a
custom property instead and let CSS consume it — this is why the banner writes
`--frame-pos` / `--frame-pos-mobile` rather than `backgroundPosition`. Custom
properties set from JSX are typed through a `--*` index signature in
[src/vite-env.d.ts](src/vite-env.d.ts).

### Content lives in `data.ts`

Copy, image imports and links are in [src/data.ts](src/data.ts), with shapes in
[src/types.ts](src/types.ts). Changing a headline, a service tab, an FAQ or the
gallery set is a `data.ts` edit and needs no component change.

---

## 11. Accessibility

- **Focus is always visible and always distinct from hover.** Keyboard users get
  a ring (`focus-visible:outline-2 focus-visible:outline-offset-2`), not the
  hover fill — a background alone is too easy to lose when tabbing. Outline
  colour is `white/90` over photography, `plum` on light.
- **44px minimum touch target.** The burger is `min-h-11 min-w-11`; arrow
  buttons are 46px.
- **Decorative is hidden.** `aria-hidden="true"` on the marquee, dot rows, the
  FAQ `+` glyph and the About outline frame.
- **Images that are backgrounds still announce.** A `div` carrying a photo as
  `background-image` takes `role="img"` with an `aria-label`.
- **A listed-but-not-live nav entry renders as a `<span>`, not a dead `<a>`** —
  nothing to click, tab to, or middle-click into a new tab. Give it an `href`
  and it becomes a normal link with no other change.
- **State is on the element, not just in the styling**: `aria-expanded` on the
  burger and FAQ rows, `aria-selected` with `role="tab"` on service tabs,
  `aria-current` on carousel dots. The FAB is `aria-hidden` and `tabIndex={-1}`
  while hidden.
- **Below-the-fold images are `loading="lazy"`.**

---

## 12. Adding a section

1. Pick the band shape (§4) and a fill that differs from the section above it.
2. Open with the eyebrow + serif `h2` pair (§8).
3. `id` on the `<section>` plus `scroll-mt-nav-offset` if it is a nav target.
4. Class strings into named `const`s above the component, joined — with a
   comment on anything whose value is not self-evident.
5. Reuse tokens. If you need a new colour or spacing value, add it to `@theme`
   rather than inlining a hex or a magic number.
6. Body copy gets a `ch` cap and `text-pretty`.
7. Any new animation gets `motion-reduce:animate-none`, plus an explicit
   fallback if stopping it leaves a broken state.
8. Any conflicting state pair gets branched, not stacked (§10).
9. Copy and images into [src/data.ts](src/data.ts).
10. `npm run typecheck`.
