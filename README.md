# Naga Sushmitha — Bridal Makeup Artist

Marketing site for a Bangalore bridal makeup artist. React + Vite.

## Running it

```bash
npm install
npm run dev      # dev server with hot reload
npm run build    # production build into dist/
npm run preview  # serve the built dist/ locally
```

## Where things live

```
index.html            Vite entry (mounts #root)
src/
  App.jsx             Section order for the whole page
  data.js             All copy, image imports and links — edit content here
  hooks/              useScrolled: drives the condensed header + floating button
  components/         One .jsx + one .module.css per section
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
photos appear in the gallery, edit [src/data.js](src/data.js) — the components
read from it and need no changes.

## Notes

- Fonts are self-hosted rather than loaded from Google Fonts, so the site has
  no third-party requests at runtime.
- `shared.module.css` deliberately holds only classes that no component
  overrides. A composed class that a component also redeclares would resolve by
  stylesheet injection order, which is not guaranteed — keep overrides local.
- The mobile breakpoint is 860px, matching the original layout.
- [legacy/index-bundle.html](legacy/index-bundle.html) is the original
  single-file build this project was reconstructed from, kept for reference.
