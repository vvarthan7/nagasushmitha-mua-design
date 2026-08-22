/* The bar's entries, in their own module because two things draw them.
 *
 * Nav.tsx renders the real bar. vite.config.ts renders a copy of it into
 * index.html as the boot layer, so the bar is on screen during the seconds
 * before React has mounted rather than appearing from nothing — and it reads
 * this list to do it, which is the whole reason the list is not still sitting
 * inside Nav.tsx. A second hard-coded copy in the Vite config would be a copy
 * that rots: renaming an entry there would leave the boot bar showing a label
 * the real bar no longer has, and nothing would catch it.
 *
 * Vite bundles its own config before running it, so the import works from Node
 * as well as from the browser. Keep this file plain data for that reason —
 * anything that touches the DOM, or imports an asset, would be dragged into the
 * config's own evaluation.
 */

/* An entry with no `href` is listed but not yet live — it renders as a span
   rather than an anchor, so there is nothing to click, tab to, or middle-click
   into a new tab. Nothing uses that today; it is kept for the next entry that
   is designed before it is built. */
export interface NavLink {
  label: string;
  href?: string;
}

/* Bare fragments point at sections of the home page; anything else is a
   document of its own and is left alone by `resolve` in Nav.

   Gallery and Blog are the second kind. Blog has no index page behind it: the
   journal is one document that renders whichever post its ?post= slug names,
   and a bare ./blog.html carries no slug, so this entry lands on the newest
   post. That is on purpose — with a handful of posts, a list of them is a
   worse landing than the best one — and it means the bar needs no edit when
   something new is published.

   Gallery is the second kind too. It used to scroll to GalleryStrip further down
   the home page, which meant the bar offered two routes to the same subject
   and neither was the full one. The strip is still there and is still a good
   teaser — AboutSection's CTA sends you to it, and the id it hangs off has not
   moved — it simply isn't what a person clicking "Gallery" in the bar is
   asking for.

   Home is not in this list because it only exists on pages that are not the
   home page; Nav prepends it when there is somewhere to go. */
export const LINKS: NavLink[] = [
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "./gallery.html", label: "Gallery" },
  { href: "./blog.html", label: "Blog" },
];

/* The call to action that closes the row. Kept out of LINKS because it is not
   one of them: it carries its own palette, it is never rewritten by `resolve`,
   and it is the one entry the mobile dropdown keeps below the fold-out. */
export const ENQUIRE_LABEL = "Enquire";

/* What the burger says when the row is collapsed, below 860px. */
export const MENU_LABEL = "Menu";
