# Naga Sushmitha — Bridal Makeup Artist

Marketing site for a Bangalore bridal makeup artist. React + TypeScript + Vite.

## Running it

```bash
npm install
npm run dev        # dev server with hot reload
npm run typecheck  # tsc in strict mode, no emit
npm run build      # typecheck, then production build into dist/
npm run preview    # serve the built dist/ locally
```

## Where things live

```
index.html            Vite entry (mounts #root)
tsconfig.json         Strict; tsc only type-checks, Vite does the transpiling
src/
  App.tsx             Section order for the whole page
  data.ts             All copy, image imports and links — edit content here
  types.ts            Shapes behind everything data.ts exports
  vite-env.d.ts       Vite asset/CSS-module types + the `--custom-property` hole
  hooks/              useScrolled: drives the condensed header + floating button
  components/         One .tsx + one .module.css per section
  styles/
    global.css        Design tokens (--plum, --blush, …), reset, marquee keyframes
    fonts.css         Self-hosted Manrope + Playfair Display @font-face
    shared.module.css Primitives reused verbatim across sections
  assets/
    gallery/          Bridal / reception shots and the service-panel photos
    editorial/        Editorial gallery shots, copied from images/editorial
    fonts/            woff2 subsets
```

Content is data-driven: to change a headline, a service tab, an FAQ or which
photos appear in the gallery, edit [src/data.ts](src/data.ts) — the components
read from it and need no changes. The shape of each list is declared in
[src/types.ts](src/types.ts), so a missing `alt` or a category that does not
exist is a build error rather than a blank space on the page.

## Notes

- Fonts are self-hosted rather than loaded from Google Fonts, so the site has
  no third-party requests at runtime.
- `GalleryCategory` is a closed union (`"Bridal" | "Editorial"`). Adding a
  category means adding a folder under `src/assets`, a glob in `data.ts`, and a
  member to that union — the compiler points at every spot that needs updating.
- CSS custom properties set from JSX (`--hero-h`, `--dir`, `--veil`) are typed
  through a narrow `--*` index signature in `vite-env.d.ts`; a typo in a real
  CSS property is still caught.
- `shared.module.css` deliberately holds only classes that no component
  overrides. A composed class that a component also redeclares would resolve by
  stylesheet injection order, which is not guaranteed — keep overrides local.
- The mobile breakpoint is 860px, matching the original layout.
- [legacy/index-bundle.html](legacy/index-bundle.html) is the original
  single-file build this project was reconstructed from, kept for reference.
