import { useEffect, useState } from "react";
import logo from "../assets/logo.png";

/* An entry with no `href` is listed but not yet live — it renders as a span
   rather than an anchor, so there is nothing to click, tab to, or middle-click
   into a new tab. Nothing uses that today; it is kept for the next entry that
   is designed before it is built. */
interface NavLink {
  label: string;
  href?: string;
}

/* Bare fragments point at sections of the home page; anything else is a
   document of its own and is left alone by `resolve` below.

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
   home page; the component prepends it when there is somewhere to go. */
const LINKS: NavLink[] = [
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "./gallery.html", label: "Gallery" },
  { href: "./blog.html", label: "Blog" },
];

/* ── Class names ───────────────────────────────────────────────────────────
   The bar has two palettes and swaps between them wholesale, which is what
   `data-solid` on the <header> is for: it is the group the rules below hang
   off, standing in for the `.solid` ancestor selector the stylesheet used.

   Fixed rather than sticky: the bar is lifted out of flow so the HeroReel
   banner starts at the top of the document and shows through behind it.
   Nothing is painted here over the banner — no tint, no blur, no border. What
   separates the bar from the photograph is the banner's own scrim, whose top
   stop is set for exactly this (see hero-scrim in styles/tailwind.css); if the
   type here ever stops reading, that gradient is what to adjust, not this.
   The group-data rules swap the whole thing back to the light-background
   palette once the page scrolls, or once the mobile dropdown opens and needs
   an opaque panel to sit on. */
const NAV = [
  "group fixed top-0 right-0 left-0 z-30 border-b border-transparent",
  "bg-transparent py-3 shadow-none backdrop-filter-none",
  "transition-all duration-400 ease-brand",
  "data-[solid=true]:border-b-border-soft data-[solid=true]:bg-white/94",
  "data-[solid=true]:py-1.5 data-[solid=true]:backdrop-blur-md",
  "data-[solid=true]:shadow-[0_6px_26px_rgba(125,54,70,0.07)]",
].join(" ");

/* The mark is a full-colour illustration, so it can't be recoloured to suit the
   dark banner the way a flat logo could — a soft shadow lifts its darks off the
   photo instead. Kept light because the banner's scrim is behind it. */
const LOGO = [
  "block h-[clamp(26px,4vw,32px)] w-auto",
  "drop-shadow-[0_2px_6px_rgba(44,26,28,0.45)]",
  "transition-[filter] duration-400 ease-brand",
  "group-data-[solid=true]:[filter:none]",
].join(" ");

/* The gap is small because the links carry 13px of their own side padding for
   the hover pill to sit in — gap + padding is what reads as the spacing, so the
   old 26px here would have pushed the row ~26px wider.

   Below 859px the row collapses into a dropdown under the bar. Opening it
   forces `solid` on in the component below, so the links inside land on the
   white panel in their dark palette rather than white-on-white. */
const LINK_ROW = [
  "flex flex-wrap items-center justify-end gap-[clamp(2px,0.8vw,7px)]",
  "upto-859:absolute upto-859:top-full upto-859:right-0 upto-859:left-0",
  "upto-859:flex-col upto-859:items-stretch upto-859:gap-1",
  "upto-859:border-t upto-859:border-t-border-soft",
  "upto-859:border-b upto-859:border-b-border-soft",
  "upto-859:bg-white upto-859:px-gutter",
  "upto-859:pt-4.5 upto-859:pb-5.5",
  "upto-859:shadow-[0_18px_40px_rgba(125,54,70,0.1)]",
].join(" ");

/* Type and both palettes for one nav entry.

   The text-shadow works with the banner's scrim rather than instead of it: its
   0.34 top stop handles the broad separation, so this only needs a tight edge
   and a small halo. Kept deliberately lighter than it would be on bare
   photography — stacking a heavy diffuse shadow on top of the scrim makes small
   type look smudged. Dropped again under `solid`, where the type turns dark on
   white.

   The hover pill: over the banner the type is already white, so colour can't
   carry the state — the background has to. It is white glass rather than a
   brand colour, because plum or rust would go muddy against whatever photo
   happens to be under it while white reads the same on all four frames. The 1px
   ring is an inset box-shadow, not a border, so nothing reflows on hover. On
   the white bar the pill flips to the blush tint used elsewhere in the palette
   and the text can take rust — there is a fixed background behind it now, so
   colour works as a state again.

   Keyboard users get a ring instead of the pill; a filled background alone is
   too easy to lose track of when tabbing.

   Below 859px these stretch to full-width rows, so the highlight reads as a
   menu row rather than a pill. The negative margin pulls the row out into the
   panel's own padding while the matching padding puts the text back exactly
   where it sat before — the highlight widens, the type does not move. */
const LINK = [
  "rounded-full px-3.25 py-1.75 font-sans text-[12px] font-bold",
  "tracking-[0.14em] text-white uppercase",
  /* The row is allowed to wrap, and these are shrinkable flex items — without
     this a multi-word label breaks inside its own pill and makes that one entry
     two lines tall. It has to give at the gaps, not mid-label. */
  "whitespace-nowrap",
  "[text-shadow:0_1px_2px_rgba(44,26,28,0.45),0_2px_10px_rgba(44,26,28,0.28)]",
  "transition-[color,background-color,box-shadow] duration-250 ease-soft",
  "hover:bg-white/18 hover:text-white",
  "hover:shadow-[inset_0_0_0_1px_rgb(255_255_255_/_0.24)]",
  "focus-visible:outline-2 focus-visible:outline-offset-2",
  "focus-visible:outline-white/90",
  "group-data-[solid=true]:text-text-muted",
  "group-data-[solid=true]:[text-shadow:none]",
  "group-data-[solid=true]:hover:bg-blush-soft",
  "group-data-[solid=true]:hover:text-rust",
  "group-data-[solid=true]:hover:shadow-[inset_0_0_0_1px_var(--color-border-soft)]",
  "group-data-[solid=true]:focus-visible:outline-plum",
  "upto-859:-mx-3.5 upto-859:my-0 upto-859:rounded-[10px]",
  "upto-859:px-3.5 upto-859:py-2.75",
].join(" ");

/* Inverted over the banner: a white pill reads as the primary action against
   the photo, where the plum fill would sink into it. Its height sets the height
   of the whole bar — it is the tallest thing in the row — so trim this before
   reaching for NAV's padding.

   The row gap is tuned for the links' hover pills, which is too tight for the
   CTA, so ml buys back its separation without widening the whole row. That is
   cancelled below 859px, where it would indent the pill in a column. */
const ENQUIRE = [
  "ml-[clamp(6px,1.2vw,14px)] rounded-full bg-white px-4.75 py-2.25",
  "text-center font-sans text-[11px] font-semibold tracking-[0.14em]",
  "text-plum uppercase transition-all duration-300 ease-soft",
  "hover:bg-blush hover:text-plum",
  "group-data-[solid=true]:bg-plum group-data-[solid=true]:text-white",
  "group-data-[solid=true]:hover:bg-rust group-data-[solid=true]:hover:text-white",
  "upto-859:mt-2.5 upto-859:ml-0",
].join(" ");

const BURGER = [
  "hidden min-h-11 min-w-11 cursor-pointer items-center",
  "justify-center rounded-full border border-white/55 bg-transparent",
  "px-3.5 py-0 text-white select-none",
  "[text-shadow:0_1px_2px_rgba(44,26,28,0.45),0_2px_10px_rgba(44,26,28,0.28)]",
  "transition-all duration-300 ease-soft",
  "group-data-[solid=true]:border-border group-data-[solid=true]:text-plum",
  "group-data-[solid=true]:[text-shadow:none]",
  "upto-859:flex",
].join(" ");

interface NavProps {
  scrolled: boolean;
  /** Where the home page is, from this page. Empty on the home page itself,
   *  which is what tells the bar it is already there; "./" on gallery.html.
   *
   *  It does three jobs, all of them the same fact stated once:
   *  - it is what the home page's fragments hang off, so "#about" becomes
   *    "./#about" away from home — a bare "#about" on gallery.html would look
   *    for a section that is not in that document and do nothing. Only bare
   *    fragments are rewritten, so "./gallery.html" passes through untouched;
   *  - it is the Home entry's href, and its emptiness is what decides whether
   *    that entry is drawn at all;
   *  - it is where the logo points. */
  homeHref?: string;
}

export default function Nav({ scrolled, homeHref = "" }: NavProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const resolve = (href: string) =>
    href.startsWith("#") ? `${homeHref}${href}` : href;

  /* Home leads the row, and only away from home — on the home page it would be
     a link to the page you are reading, which is noise in a bar this short. */
  const links: NavLink[] = homeHref
    ? [{ href: homeHref, label: "Home" }, ...LINKS]
    : LINKS;

  // The dropdown only exists below 860px; a resize past that point would
  // otherwise leave it flagged open underneath the desktop bar.
  useEffect(() => {
    const onResize = () => setMenuOpen(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // The bar floats over the banner, so it only takes a background once there is
  // page behind it to hide — or once the mobile dropdown needs one to sit on.
  const solid = scrolled || menuOpen;

  return (
    <header className={NAV} data-solid={solid}>
      <div className="mx-auto flex max-w-shell items-center justify-between gap-4 px-gutter">
        {/* The mark is the conventional way back to the home page, so away
            from home that is where it goes. On the home page there is nowhere
            to go and it falls back to "#top" — the one fragment that needs no
            element to match, which browsers answer by scrolling the document
            to the top. */}
        <a href={homeHref || "#top"} className="flex shrink-0 items-center gap-2.5">
          <img src={logo} alt="" className={LOGO} />
          {/* <span className="font-serif text-[clamp(15px,2.4vw,20px)] whitespace-nowrap text-white italic [text-shadow:0_1px_2px_rgba(44,26,28,0.45),0_2px_12px_rgba(44,26,28,0.3)] transition-[color] duration-400 ease-brand group-data-[solid=true]:text-ink group-data-[solid=true]:[text-shadow:none]">
            NS Makeup Artistry
          </span> */}
        </a>

        {/* Only one of the two display utilities is ever on the element: below
            859px they would otherwise both apply and the stylesheet's order,
            not this one, would decide which won. */}
        <nav
          className={`${LINK_ROW} ${menuOpen ? "upto-859:flex" : "upto-859:hidden"}`}
        >
          {links.map((l) =>
            l.href ? (
              <a key={l.label} href={resolve(l.href)} className={LINK}>
                {l.label}
              </a>
            ) : (
              <span key={l.label} className={LINK}>
                {l.label}
              </span>
            ),
          )}
          {/* Not resolved either: every page that shows this bar also renders
              <Enquire>, so the form is always in the current document and
              sending this to the home page would be a needless page load. A
              page that drops <Enquire> has to pass its href through resolve. */}
          <a href="#enquire" className={ENQUIRE}>
            Enquire
          </a>
        </nav>

        <button
          type="button"
          className={BURGER}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="font-sans text-[10px] font-semibold tracking-[0.16em] uppercase">
            {menuOpen ? "Close" : "Menu"}
          </span>
        </button>
      </div>
    </header>
  );
}
