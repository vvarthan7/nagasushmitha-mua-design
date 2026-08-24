import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { works as allWorks, workFilters } from "../data";
import type { Work, WorkCategory } from "../types";
import { pill } from "../styles/ui";

/* ── Class names ───────────────────────────────────────────────────────────
   Grouped up here rather than inline for the same reason the rest of the
   project does it: the ones worth explaining are the ones long enough to bury
   their own reasoning in a className attribute.

   The grid is CSS columns, not grid. That is what makes it masonry without
   measuring anything in JS — each tile keeps its own height and the browser
   fills the shortest column. The cost is reading order: columns flow top to
   bottom, so tile 2 sits under tile 1 rather than beside it. That is fine for
   a portfolio, where the set has no order to lose, and it is the reason this
   is not the layout for anything that reads as a sequence.

   Column counts step 2 → 3 → 4 rather than starting at 1, because these tiles
   are small and a single column of them on a phone is a very long page. */
const GRID = [
  "columns-2 gap-3 px-5 pb-8",
  "md:columns-3 md:gap-5.5 md:px-gutter md:pb-16",
  "lg:columns-4",
].join(" ");

/* `break-inside-avoid` is what stops a tile being split across a column
   boundary; without it the columns layout will happily cut one in half.

   `group` is what the frame's lift hangs off. It has to be here, on the button,
   because this element does not move — see FRAME. */
const TILE =
  "group mb-3 block w-full cursor-zoom-in break-inside-avoid text-left md:mb-5.5";

/* The lift is a transform, not a margin, so nothing around it reflows.

   It keys off `group-hover` rather than the frame's own `hover`, and that is
   not a style choice — a plain `hover:` here oscillates, and the further it
   travels the worse it gets. The frame is the element that rises, so the
   moment it does, the strip of floor it just left is no longer under it. A
   cursor resting there loses the hover, which drops the frame back down, which
   puts it under the cursor again: the tile flickers for as long as the pointer
   sits near its lower edge. Hanging the state on the button fixes it because
   the button never moves — its hit area is exactly where it was. Gallery.tsx
   does the same thing for the same reason.

   Travel is capped by the gap between tiles, not by taste: a tile that rises
   further than the space above it collides with its neighbour. The column gap
   is the `mb` on TILE — 12px, 22px above 768px — so these leave 4px and 10px
   of daylight respectively. Raise one of these and the matching `mb` has to go
   with it.

   The two durations are what make it settle rather than snap. Hover-in takes
   the 350ms, because a lift that lags feels broken; hover-out keeps the base
   500ms, because there is nothing to acknowledge on the way down and the
   slower fall is the half that reads as graceful. `ease-soft` is the CSS
   `ease` curve, gentle at both ends — `ease-brand` is an ease-out, which
   leaves the fall dropping fastest right at the start.

   All of it still compiles behind a real-pointer media query, so a tap on a
   phone does not leave a tile stuck raised. */
const FRAME = [
  "overflow-hidden rounded-[14px] bg-white shadow-tile md:rounded-[18px]",
  "transition-[transform,box-shadow] duration-500 ease-soft",
  "group-hover:-translate-y-2 group-hover:shadow-lift group-hover:duration-350",
  "md:group-hover:-translate-y-3",
].join(" ");

/* Layer 60, alongside the gallery strip's viewer — above the nav (30) and the
   WhatsApp button (40). `fixed` rather than `absolute`: the viewer has to cover the viewport,
   and this component is a full page of scrolling tiles, so an absolutely
   positioned overlay would be pinned to the top of the grid and open off
   screen for anything below the fold. */
const VIEWER = [
  "fixed inset-0 z-60 flex flex-col items-center justify-center gap-4.5",
  "bg-blush/98 p-6 animate-scrim-in",
  "md:flex-row md:gap-7.5 md:p-12",
].join(" ");

/* Carries no display utility on purpose. Two of the four buttons below are
   `hidden md:grid` and two are always `grid`, and `hidden` versus `grid` in one
   className is decided by the order Tailwind emits them, not the order they are
   written — the same trap styles/ui.ts documents. Each caller states its own
   display instead. */
const ARROW = [
  "size-11.5 shrink-0 place-items-center rounded-full",
  "border border-border bg-white text-base text-plum",
  "transition-colors duration-250 ease-soft hover:bg-blush-soft",
].join(" ");

/* ── One tile's photo ──────────────────────────────────────────────────────
   Its own component because it holds state — whether this particular photo has
   arrived — and the grid must not re-render all eighteen tiles every time one
   of them finishes loading.

   The placeholder sits behind the real photo rather than being swapped for it,
   so there is never a frame with nothing in it. Both are absolutely stacked in
   the same box; only the top one's opacity moves.

   `scale-110` on the placeholder is not decoration. `blur()` samples pixels
   from beyond the element's edge, and there are none, so a blurred layer fades
   to transparent at its own border and shows a pale halo against the frame.
   Oversizing it by 10% pushes that halo outside the overflow-hidden frame,
   where it is clipped away. */

/* Photos this page has finished downloading at least once, by URL.

   It lives outside the component because it has to outlive one. Changing the
   filter unmounts every tile that leaves the set, so the tiles that come back
   when the filter widens again are new instances starting from scratch — and
   with `loaded` as plain component state they replayed the whole blur-to-sharp
   fade for photos already sitting in memory. Which is right for a first view
   and wrong for the fourth.

   A module-level Set rather than state lifted into the grid, because "has this
   URL been fetched" is a fact about the browser, not about a React subtree.
   Nothing reads it during render except the initialiser below, so it never
   needs to trigger one, and it wants exactly the lifetime it has: the page.

   Note that `loading="lazy"` is why the img's own `complete` flag cannot do
   this job alone. A remounted tile's image is in cache, but the browser has
   not necessarily re-attached it by the time React runs the ref, so `complete`
   reads false and the placeholder flashes anyway. */
const settled = new Set<string>();

function TileImage({ work }: { work: Work }) {
  /* Lazy initialiser, evaluated once on mount: a returning tile opens resolved
     rather than transitioning to it, so there is no fade at all the second
     time. Safe against a stale read because the button's `key` is the work id,
     which pins one instance to one photo for the life of the grid. */
  const [loaded, setLoaded] = useState(() => settled.has(work.src));

  const settle = useCallback(() => {
    settled.add(work.src);
    setLoaded(true);
  }, [work.src]);

  /* A ref callback alongside onLoad. A cached photo can finish loading before
     React has attached its handler and then onLoad never fires, leaving the
     placeholder up over a photo that is sitting right there. `complete` is the
     state rather than the event, so it catches that case. */
  const check = useCallback(
    (img: HTMLImageElement | null) => {
      if (img?.complete) settle();
    },
    [settle],
  );

  return (
    <div className="relative">
      <div
        aria-hidden
        style={{
          backgroundImage: `url("${work.blur}")`,
          backgroundPosition: work.position,
        }}
        className={[
          "pointer-events-none absolute inset-0 scale-110 bg-cover blur-lg",
          "transition-opacity duration-700 ease-soft",
          loaded ? "opacity-0" : "opacity-100",
        ].join(" ")}
      />
      <img
        ref={check}
        src={work.src}
        alt={work.title}
        /* One file serves the tile and the viewer, and some of the sources are
           8MP-plus, so this matters more here than it usually would — see the
           note in data.ts. It is also what makes the placeholder worth having:
           a lazy photo below the fold does not even begin loading until it is
           scrolled near, so without this the tile would be blank until then. */
        loading="lazy"
        decoding="async"
        onLoad={settle}
        style={{ objectPosition: work.position }}
        className={[
          "relative h-(--tile-hm) w-full object-cover md:h-(--tile-h)",
          "transition-opacity duration-700 ease-soft",
          loaded ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />
    </div>
  );
}

export interface PortfolioProps {
  /** Defaults to the full set. Passed in mainly so a shorter cut of the grid
   *  can be dropped into another page without a second component. */
  works?: readonly Work[];
  eyebrow?: string;
  /** Headline. Everything up to `headingAccent` is set in the serif roman,
   *  the accent itself in plum italic. */
  heading?: string;
  headingAccent?: string;
  subhead?: string;
}

export default function Portfolio({
  works = allWorks,
  eyebrow = "Portfolio",
  heading = "Every face, its own ",
  headingAccent = "light",
  subhead = "Tap any frame to open it.",
}: PortfolioProps) {
  /* There is no unfiltered view, so the grid always opens on a category. It is
     named here rather than read off `workFilters[0]` because that row is
     derived from the photos — its first entry is only Bridal for as long as a
     bridal photo is still in the set — and a default that quietly follows the
     data is worse than one that has to be changed in both places on purpose.
     See the note above WORK_CATEGORY_ORDER in data.ts. */
  const [filter, setFilter] = useState<WorkCategory>("Bridal");
  /* An index into `shown`, not into `works` — which is why changing the
     filter closes the viewer below rather than trying to carry the position
     across two different lists. */
  const [index, setIndex] = useState<number | null>(null);

  const shown = useMemo(
    () => works.filter((w) => w.category === filter),
    [works, filter],
  );

  const close = useCallback(() => setIndex(null), []);

  /* Wraps at both ends, so the arrows never dead-end and never need disabling. */
  const step = useCallback(
    (by: number) =>
      setIndex((i) => (i === null ? i : (i + by + shown.length) % shown.length)),
    [shown.length],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, close, step]);

  const current = index === null ? null : shown[index];

  return (
    <section id="portfolio" className="bg-blush font-sans text-ink">
      <div className="flex flex-col items-center gap-2.5 px-gutter pt-8 pb-6 text-center md:pt-10">
        <p className="font-sans text-[10px] tracking-[0.26em] text-rust uppercase">
          {eyebrow}
        </p>
        <h1 className="font-serif text-[clamp(28px,4vw,38px)] font-normal">
          {heading}
          <em className="text-plum">{headingAccent}</em>
        </h1>
        <p className="max-w-[46ch] text-pretty text-sm leading-[1.8] text-text">
          {subhead}
        </p>
      </div>

      {/* Wraps at every width. It used to scroll horizontally below 768px,
          which kept the row one line tall but hid half the filters off the
          right edge behind no affordance — on a phone there is no scrollbar to
          suggest they are there, and the five categories are the only way to
          navigate this page. Better to spend two extra lines and show all of
          them.

          How many land per line is left to the browser rather than fixed at
          two or three: the labels run from "Party" to "Behind the Scenes", so
          any fixed count would either strand the short chips in half-empty rows
          or force the long one to wrap inside itself. `pill`'s compact form
          buys the width back that the padding was spending. */}
      <div className="flex flex-wrap justify-center gap-2 px-5 pb-8 md:px-gutter md:pb-10">
        {workFilters.map((name) => {
          const on = filter === name;
          return (
            <button
              key={name}
              type="button"
              aria-pressed={on}
              onClick={() => {
                setFilter(name);
                close();
              }}
              className={pill(on, true)}
            >
              {name}
            </button>
          );
        })}
      </div>

      <div className={GRID}>
        {shown.map((w, i) => (
          <button
            key={w.id}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Open ${w.title}`}
            /* The two heights ride in as custom properties so the breakpoint
               stays in the className where every other breakpoint in this
               project lives, rather than becoming a resize listener. */
            style={
              {
                "--tile-h": `${w.height}px`,
                "--tile-hm": `${w.mobileHeight}px`,
              } as React.CSSProperties
            }
            className={TILE}
          >
            <div className={FRAME}>
              <TileImage work={w} />
            </div>
          </button>
        ))}
      </div>

      {current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={current.title}
          className={VIEWER}
        >
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous"
            className={`${ARROW} hidden md:grid`}
          >
            ←
          </button>

          {/* No caption: the photograph is the whole panel. The title still
              reaches a screen reader twice over — as the image's alt text and
              as the dialog's own accessible name — so removing it costs
              nothing but the printed line.

              bg-white is not decoration here even though nothing shows through
              a loaded photo: it is what the rounded corners paint against for
              the moment before one arrives. */}
          <div className="w-full overflow-hidden rounded-2xl bg-white shadow-lift animate-panel-in md:w-auto md:rounded-[18px]">
            {/* Sized by height above 768px, not width. The binding constraint
                is vertical — a 4:5 portrait runs out of screen height long
                before it runs out of width — so stating the height and letting
                aspect-ratio derive the width is what lets it grow as far as it
                can without a media query per breakpoint. 78svh keeps it inside
                the viewport from roughly 600px of height upward, counting the
                viewer's own p-12; the 720px cap stops it ballooning on a tall
                desktop monitor. Below 768px it stays full-width, where width is
                the constraint instead. */}
            <img
              src={current.src}
              alt={current.title}
              style={{ objectPosition: current.position }}
              className="aspect-4/5 w-full object-cover md:h-[min(78svh,720px)] md:w-auto"
            />
          </div>

          {/* Below 768px the arrows come out from the sides of the photo and
              sit under it as a pair — at phone widths there is no room beside
              a full-width panel for a 46px target. */}
          <div className="flex gap-3.5 md:hidden">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous"
              className={`${ARROW} grid`}
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next"
              className={`${ARROW} grid`}
            >
              →
            </button>
          </div>

          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next"
            className={`${ARROW} hidden md:grid`}
          >
            →
          </button>

          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className={`${ARROW} absolute top-4.5 right-4.5 grid md:top-6.5 md:right-7.5`}
          >
            ✕
          </button>
        </div>
      )}
    </section>
  );
}
