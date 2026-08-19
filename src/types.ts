/* The shapes behind everything data.ts exports. Components import these rather
   than re-describing the same objects in their own props. */

/** Every photo carries one of these, and there is no unfiltered view — so the
 *  set is closed rather than an open string. Adding a category means adding a
 *  folder under src/assets and a member here. */
export type GalleryCategory = "Bridal" | "Editorial";

/** One photo in the gallery. `src` is the hashed URL Vite hands back from an
 *  image import, so it is a plain string by the time it reaches a component. */
export interface GalleryShot {
  src: string;
  category: GalleryCategory;
  /** background-position for a GalleryStrip card. Nothing sets it today — the
   *  card falls back to "center" — but it is read, so a photo that crops badly
   *  can carry its own framing without a change to the component. */
  position?: string;
}

/** The portfolio page's own category set, deliberately wider than
 *  GalleryCategory: the home-page strip is folder-driven and only knows what a
 *  photo's folder says, while these are hand-assigned per photo. The two lists
 *  are separate on purpose — adding a category here does not touch the home
 *  page, and does not need a new folder under src/assets. */
export type WorkCategory =
  | "Bridal"
  | "Editorial"
  | "Beauty"
  | "Before & After"
  | "Behind the Scenes";

/** WorkCategory plus the grid's unfiltered view, which is where the portfolio
 *  opens. That is the other thing separating it from the gallery strip: there,
 *  every photo carries a category and one is always selected. */
export type WorkFilter = "All" | WorkCategory;

/** One tile in the portfolio grid. */
export interface Work {
  /** Stable key for the tile, independent of filter order. */
  id: number;
  title: string;
  category: WorkCategory;
  /** Place and year. Carried but not currently drawn — the viewer used to
   *  print it under the title and no longer shows a caption at all. Kept
   *  because it is the one field that cannot be recovered from the file, so
   *  losing it would mean sourcing every date again. */
  meta: string;
  /** The hashed URL Vite hands back from an image import, as GalleryShot.src.
   *  One file serves both the tile and the viewer — there are no resized
   *  copies, which is why the tiles are lazy (see Portfolio). */
  src: string;
  /** Blur-up placeholder: a 20px WebP of this same photo, inline as a data
   *  URI, held under the tile until `src` arrives. Generated — see
   *  scripts/generate-blur.mjs — and paired with `src` through one key in
   *  data.ts rather than named separately, so the two cannot drift apart. */
  blur: string;
  /** object-position for the tile crop, set against where the face falls in
   *  this particular frame rather than to a shared default. */
  position: string;
  /** Masonry tile height in px, desktop and below 768px. Set per photo from
   *  its aspect ratio — the landscape sources take the short tiles — so a
   *  swapped photo needs both values re-picked with it. */
  height: number;
  mobileHeight: number;
}

/** One frame of the banner's dissolve cycle. See the note above
 *  `heroReelFrames` in data.ts for why the positions are per-photo. */
export interface HeroReelFrame {
  src: string;
  /** background-position used at every width. Only its Y takes effect on
   *  desktop, where the crop is height-driven. */
  position: string;
  /** Overrides `position` below 860px, where the banner goes portrait and the
   *  crop becomes width-driven. Falls back to `position` when absent. */
  mobilePosition?: string;
  alt: string;
}

export interface HeroStat {
  value: string;
  label: string;
}

export interface BookingStep {
  /** Displayed step number, zero-padded ("01"), so it is a string not a count. */
  n: string;
  title: string;
  body: string;
}

export interface Service {
  /** Short label for the tab. */
  name: string;
  title: string;
  body: string;
  pills: string[];
  image: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface Testimonial {
  /** May contain *asterisk-wrapped* runs, which Testimonials renders bold. */
  testimonial: string;
  name: string;
  meta: string;
}
