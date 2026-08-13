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
  /** background-position for the coverflow card. Nothing sets it today — the
   *  card falls back to "center" — but it is read, so a photo that crops badly
   *  can carry its own framing without a change to the component. */
  position?: string;
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
