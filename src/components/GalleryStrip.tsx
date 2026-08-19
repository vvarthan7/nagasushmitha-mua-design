import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { gallery, galleryFilters } from "../data";
import type { GalleryCategory, GalleryShot } from "../types";
import { useDragStep } from "../hooks/useDragStep";
import { pill } from "../styles/ui";

/**
 * GalleryStrip — pills + coverflow.
 * Hero frame at centre, neighbours shrunk and dimmed, everything sliding
 * through the middle. Arrows, clicking a side frame, dragging, and ← / → all
 * move the ring; the category buttons swap the ring for a different set;
 * clicking the centre frame opens the viewer.
 *
 * Three components, all private to this file: the section, the <Ring> it
 * renders (twice during a set swap), and the <Viewer> overlay — which is the
 * same ring again, on a dark ground.
 */

/* Photos are folder-driven through data.ts — drop a file into
   src/assets/bridal or src/assets/editorial and it joins the set. This is a
   teaser, so each set is capped: five cards are on screen at once, and past
   ten the extra frames are payload nobody swipes to. */
const MAX_SHOTS = 10;

/** How many cards flank the centre one. Further out than this they are hidden
 *  and inert. The page shows two either side; the viewer overrides to one, its
 *  frames being large enough that a second pair only crowds them. */
const SIDES = 2;
/** How long the outgoing set stays mounted. Must match animate-layer-out. */
const SWAP_MS = 460;

/** The photos behind one button, in the order the folder gives them. */
const categoryShots = (category: GalleryCategory): GalleryShot[] =>
  gallery.filter((g) => g.category === category).slice(0, MAX_SHOTS);

/* ── Class names ───────────────────────────────────────────────────────────

   The three numbers that size a ring live on the stage as custom properties:
   the card (--card-w / --card-h) and the pitch between neighbours (--slot).
   They are CSS rather than constants in this file because the viewer runs
   bigger frames than the page and both come down on small screens, which is a
   media query's job — and because the transform on each card multiplies --slot
   by its slot offset. Keep the pitch under the card width or the neighbours
   stop overlapping and the coverflow reads as a plain row.

   Stage heights on the scale below, in px: 120 = 480, 105 = 420, 150 = 600,
   117.5 = 470, 82.5 = 330. */

/* Off-frame cards sit well outside the section, so the clip stays even though
   there is no longer a frame to see. max-width on its own would leave the card
   flush to the viewport edge on small screens, so the gutter is subtracted from
   the width instead. */
const SECTION = [
  "mx-auto mb-[clamp(40px,6vw,72px)] flex flex-col gap-7.5",
  "w-[min(var(--container-shell),100%_-_2_*_var(--spacing-gutter))]",
  "scroll-mt-nav-offset overflow-hidden bg-white text-ink",
  "pt-[clamp(30px,4vw,52px)] pb-[clamp(26px,3vw,40px)]",
].join(" ");

const CTA = [
  "inline-flex items-center gap-2 rounded-full border border-ink px-5 py-2.75",
  "font-sans text-[10px] font-semibold tracking-[0.14em] text-ink uppercase",
  "transition-all duration-280 ease-soft hover:bg-ink hover:text-white",
].join(" ");

const STAGE = [
  "relative h-120 cursor-grab touch-pan-y active:cursor-grabbing",
  "[--card-w:320px] [--card-h:430px] [--slot:250px]",
  "focus-visible:outline-2 focus-visible:outline-offset-6",
  "focus-visible:outline-plum",
  /* Narrower cards on small screens, so the neighbours still peek instead of
     running off under the centre frame. */
  "upto-900:h-105 upto-900:[--card-w:240px]",
  "upto-900:[--card-h:330px] upto-900:[--slot:200px]",
].join(" ");

/* The out-of-focus veil is the ::after: its opacity comes from the card's
   inline --veil, which is 0 at the centre and deepens with distance, so the
   tint fades in and out on the same beat as the blur rather than snapping.
   --veil-tint is a variable so the viewer can veil towards its dark ground
   rather than glowing pale against it.

   The transition is a single shorthand because the four properties do not share
   a duration or a curve. It is also overridden inline on wrapping cards, which
   must teleport rather than sweep across the frame. */
const CARD = [
  "absolute top-1/2 left-1/2 h-[var(--card-h)] w-[var(--card-w)]",
  "cursor-pointer overflow-hidden rounded-[18px] bg-blush bg-cover bg-no-repeat",
  "[transition:transform_0.78s_cubic-bezier(0.2,0.75,0.25,1),opacity_0.5s_ease,filter_0.6s_ease,box-shadow_0.6s_ease]",
  "after:pointer-events-none after:absolute after:inset-0 after:content-['']",
  "after:bg-[var(--veil-tint,var(--color-blush))]",
  "after:opacity-[var(--veil,0)]",
  "after:transition-opacity after:duration-600 after:ease-soft",
  "motion-reduce:[transition:opacity_0.3s_ease]",
].join(" ");

const ARROW = [
  "flex h-11.5 w-11.5 cursor-pointer items-center justify-center rounded-full",
  "border border-ink bg-white text-[16px] leading-none text-ink",
  "transition-all duration-250 ease-soft",
  "hover:border-plum hover:bg-plum hover:text-white",
].join(" ");

/* ── Viewer overlay ───────────────────────────────────────────────────────
   The same ring on a dark ground, portalled to <body>. Layer 60, alongside
   Lightbox — above the nav (30) and the WhatsApp button (40). */

const SCRIM = [
  "fixed inset-0 z-60 flex animate-scrim-in items-center justify-center",
  "bg-ink/94 p-[clamp(14px,3vw,36px)]",
  /* The outermost frames sit wider than the viewport at these sizes — they are
     meant to run off the edges, not to push the page sideways. */
  "overflow-hidden",
].join(" ");

const PANEL = [
  "relative flex w-[min(var(--container-shell),100%)] animate-panel-in",
  "flex-col items-center gap-[clamp(16px,2.6vw,26px)]",
  /* Focus is moved here on open only so the dialog is announced and the keys
     have somewhere to land; it is not a control, so it shows no ring. */
  "outline-none",
].join(" ");

const CLOSE = [
  /* Above the ring: the outermost card reaches within a few px of the panel's
     right edge at full width, and cards stack to z-index 20. */
  "absolute -top-1.5 right-0 z-40 h-10.5 w-10.5 cursor-pointer rounded-full",
  "border border-footer-border bg-transparent text-[22px] leading-none",
  "text-on-dark transition-all duration-250 ease-soft",
  "hover:border-on-dark-strong hover:text-on-dark-strong",
].join(" ");

/* Frames run ~30% larger here than on the page — the overlay has the whole
   viewport to spend, and this is the view people open to actually look. The
   pitch grows with them so the neighbours keep the same overlap. It gives that
   extra size up under 900px, where there is no room to spend it.

   Short viewports — a laptop at 800px tall still has to fit the ring, the dots
   and the CTA. Scaling the stage whole keeps the pitch in proportion; the
   height comes down with it to close the gap that would otherwise be left. */
const VIEWER_STAGE = [
  "relative h-150 w-full cursor-grab touch-pan-y active:cursor-grabbing",
  "[--card-w:420px] [--card-h:560px] [--slot:330px]",
  /* Out-of-focus frames sink into the dark rather than hazing pale over it. */
  "[--veil-tint:var(--color-ink)]",
  "upto-900:h-105 upto-900:[--card-w:240px]",
  "upto-900:[--card-h:330px] upto-900:[--slot:200px]",
  "short:h-117.5 short:scale-[0.78]",
  "shorter:h-82.5 shorter:scale-[0.55]",
].join(" ");

const VIEWER_ARROW = [
  "flex h-11 w-11 flex-none cursor-pointer items-center justify-center",
  /* The same border the View all CTA carries — footer-border is near-black and
     disappears into the scrim. */
  "rounded-full border border-academy-border bg-transparent",
  "text-[16px] leading-none text-on-dark-strong",
  "transition-all duration-250 ease-soft",
  "hover:border-plum hover:bg-plum hover:text-white",
  "upto-900:h-10 upto-900:w-10",
].join(" ");

const DOT = "h-2 rounded-full transition-all duration-320 ease-brand";

/** The active dot stretches into a bar, so the position reads at a glance
 *  without relying on the colour difference alone. */
const DOT_STATE = {
  on: "w-6.5 bg-on-dark-strong opacity-100",
  off: "w-2 bg-footer-text opacity-55 hover:opacity-100",
};

const VIEW_ALL = [
  "inline-flex items-center gap-2 rounded-full border border-academy-border",
  "px-6 py-3 font-sans text-[10px] font-semibold tracking-[0.14em]",
  "text-on-dark-strong uppercase transition-all duration-280 ease-soft",
  "hover:border-on-dark-strong hover:bg-on-dark-strong hover:text-ink",
].join(" ");

/** The set on its way out, frozen at the index it was left on. */
interface LeavingSet {
  category: GalleryCategory;
  index: number;
}

interface GalleryStripProps {
  categories?: readonly GalleryCategory[];
  defaultCategory?: GalleryCategory;
  eyebrow?: string;
  heading?: string;
  headingAccent?: string;
  lead?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export default function GalleryStrip({
  categories = galleryFilters,
  defaultCategory = galleryFilters[0],
  eyebrow = "Gallery",
  heading = "Look by",
  headingAccent = "look",
  lead = "Bridal chairs, art shoots, prosthetics — the range, as it was shot.",
  ctaLabel = "View more",
  ctaHref = "#",
}: GalleryStripProps) {
  const [category, setCategory] = useState<GalleryCategory>(defaultCategory);
  /* `index` grows unbounded — direction of travel is the sign of the step, so
     going from the last photo to the first still slides forward. */
  const [index, setIndex] = useState(0);
  /* The set on its way out. It stays mounted for the length of the cross-fade,
     holding the index it was left on, so the stage is never empty mid-swap —
     the old photos are still leaving as the new ones arrive. */
  const [leaving, setLeaving] = useState<LeavingSet | null>(null);
  /* Which photo the viewer is open on, or null for closed. */
  const [viewing, setViewing] = useState<number | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const step = useCallback((d: number) => setIndex((i) => i + d), []);
  useDragStep(stageRef, step);

  /* Sets travel the way the row reads: Editorial sits right of Bridal, so it
     pushes in from the right and Bridal leaves to the left. */
  const dir =
    leaving && categories.indexOf(category) < categories.indexOf(leaving.category)
      ? -1
      : 1;

  const showCategory = (name: GalleryCategory) => {
    if (name === category) return;
    setLeaving({ category, index });
    setCategory(name);
    setIndex(0);
  };

  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => setLeaving(null), SWAP_MS);
    return () => clearTimeout(t);
  }, [leaving]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
    if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
  };

  return (
    <section id="gallery" className={SECTION}>
      <header className="flex flex-col items-center gap-3 px-6 text-center">
        <p className="text-[10px] tracking-[0.26em] text-rust uppercase">
          {eyebrow}
        </p>
        <h2 className="font-serif text-[clamp(28px,3.4vw,44px)] leading-[1.1] font-normal [&_em]:text-plum">
          {heading} <em>{headingAccent}</em>
        </h2>
        <p className="max-w-[42ch] text-[13.5px] leading-[1.7] text-pretty text-text">
          {lead}
        </p>
      </header>

      <div className="flex flex-wrap justify-center gap-2.5 px-6">
        {categories.map((name) => (
          <button
            key={name}
            type="button"
            aria-pressed={name === category}
            className={pill(name === category)}
            onClick={() => showCategory(name)}
          >
            {name}
          </button>
        ))}
        <a className={CTA} href={ctaHref}>
          {ctaLabel} <span aria-hidden="true">→</span>
        </a>
      </div>

      <div
        className={STAGE}
        ref={stageRef}
        role="group"
        aria-label={`${category} carousel`}
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        {/* Both layers are keyed by category, so a swap mounts a fresh ring at
            its final positions rather than sliding the old one into place —
            the layer animation carries the movement instead. */}
        {leaving && (
          <Ring
            key={leaving.category}
            category={leaving.category}
            index={leaving.index}
            dir={dir}
            exiting
          />
        )}
        <Ring
          key={category}
          category={category}
          index={index}
          dir={dir}
          onStep={step}
          onOpen={setViewing}
        />
      </div>

      <div className="flex justify-center gap-3">
        <button type="button" className={ARROW} aria-label="Previous look" onClick={() => step(-1)}>
          ←
        </button>
        <button type="button" className={ARROW} aria-label="Next look" onClick={() => step(1)}>
          →
        </button>
      </div>

      {viewing !== null && (
        <Viewer
          category={category}
          startAt={viewing}
          onClose={() => setViewing(null)}
          ctaHref={ctaHref}
        />
      )}
    </section>
  );
}

interface RingProps {
  category: GalleryCategory;
  index: number;
  /** Which way the layer animation carries a set swap: 1 in from the right. */
  dir?: number;
  exiting?: boolean;
  /** Signed step, matching the arrows and the drag hook. */
  onStep?: (delta: number) => void;
  /** Index of the photo within the set, not the slot it sits in. */
  onOpen?: (photo: number) => void;
  sides?: number;
}

/**
 * One category's ring. Two of these are on stage during a swap — the outgoing
 * one frozen at the index it was left on and inert, the incoming one live.
 *
 * The ring is laid out as `laps` copies of the set, so both sides of the
 * centre are always filled and every wrap happens off-frame (slot |4| or
 * beyond, where cards are already invisible and carry no transition).
 * Because RING is a multiple of the set length, any five neighbouring slots
 * are five different photos — nothing repeats on screen.
 */
function Ring({ category, index, dir = 1, exiting = false, onStep, onOpen, sides = SIDES }: RingProps) {
  const shots = useMemo(() => categoryShots(category), [category]);

  const n = shots.length;
  if (!n) return null;

  /* Two laps is enough once there are 8+ photos; below that, three. */
  const laps = Math.max(2, Math.ceil(15 / n));
  const RING = n * laps;
  const centreSlot = ((index % RING) + RING) % RING;

  /** Signed slot offset from centre, shortest way round the ring. */
  const rel = (slot: number) => {
    let d = slot - centreSlot;
    while (d > RING / 2) d -= RING;
    while (d < -RING / 2) d += RING;
    return d;
  };

  /* One category's ring. During a swap there are two, stacked — so the stage is
     never empty, the old photos are still on their way out as the new ones
     arrive. Reduced motion keeps the cross-dissolve and drops only the travel,
     so the stage still never blanks. The outgoing set is a ghost: it must not
     swallow clicks aimed at the new one. */
  const layer = exiting
    ? "animate-layer-out pointer-events-none motion-reduce:animate-layer-fade-out"
    : "animate-layer-in motion-reduce:animate-layer-fade-in";

  return (
    <div
      className={`absolute inset-0 ${layer}`}
      style={{ "--dir": dir }}
      aria-hidden={exiting || undefined}
    >
      {Array.from({ length: RING }, (_, slot) => {
        const shot = shots[slot % n];
        const r = rel(slot);
        const a = Math.abs(r);
        const isCentre = r === 0;
        const shown = a <= sides;
        const photo = slot % n;
        /* Side frames travel; the centre one, having nowhere to go, opens the
           viewer instead — hence the two cursors. */
        const opens = isCentre ? onOpen : undefined;
        return (
          <button
            key={slot}
            type="button"
            className={CARD}
            aria-label={`${opens ? "Open " : ""}${category} look ${photo + 1}`}
            aria-hidden={!shown}
            tabIndex={shown && !exiting ? 0 : -1}
            onClick={() => (opens ? opens(photo) : onStep?.(r))}
            style={{
              backgroundImage: `url("${shot.src}")`,
              backgroundPosition: shot.position || "center",
              /* Depth of field: the further off centre, the softer and the
                 deeper under the veil (drawn by the card's ::after, which
                 reads this custom property). */
              "--veil": isCentre ? 0 : 0.14 + (a - 1) * 0.12,
              transform: `translate(-50%, -50%) translateX(calc(var(--slot) * ${r})) scale(${Math.max(
                0.5,
                1 - a * 0.13,
              )})`,
              opacity: shown ? 1 : 0,
              zIndex: 20 - a,
              pointerEvents: shown ? "auto" : "none",
              cursor: opens ? "zoom-in" : "pointer",
              /* Wrapping cards must teleport, not sweep across the frame. */
              transition: a >= 4 ? "none" : undefined,
              filter: isCentre ? "none" : `blur(${a * 2.5}px) saturate(.82)`,
              boxShadow: isCentre
                ? "0 26px 60px rgba(44,26,28,0.26)"
                : "0 12px 30px rgba(44,26,28,0.14)",
            }}
          />
        );
      })}
    </div>
  );
}

interface ViewerProps {
  category: GalleryCategory;
  startAt?: number;
  onClose: () => void;
  ctaLabel?: string;
  ctaHref?: string;
}

/**
 * Full-screen viewer for one category — the same ring, on a dark ground and
 * without the category buttons: you are already inside a set, so the only
 * travel offered is within it. Arrows flank the frames, dots below jump
 * straight to a photo, and the CTA leaves for the full gallery.
 *
 * Portalled to <body> so no ancestor's stacking or clipping can catch it, and
 * it sits on the same overlay layer as Lightbox (z-index 60).
 */
function Viewer({ category, startAt = 0, onClose, ctaLabel = "View all", ctaHref = "#" }: ViewerProps) {
  const [index, setIndex] = useState(startAt);
  const stageRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const shots = useMemo(() => categoryShots(category), [category]);
  const n = shots.length;
  const active = ((index % n) + n) % n;

  const step = useCallback((d: number) => setIndex((i) => i + d), []);
  useDragStep(stageRef, step);

  /** Travel the short way round to a photo rather than jumping to it. */
  const pick = (photo: number) => {
    let d = photo - active;
    while (d > n / 2) d -= n;
    while (d < -n / 2) d += n;
    step(d);
  };

  /* The overlay owns the keyboard while it is up: Escape leaves, arrows
     travel. Bound to the window rather than the panel so it works wherever
     focus has wandered inside the dialog. */
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, step]);

  /* The page behind must not scroll under the overlay. */
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, []);

  /* Move focus in, so the reader announces the dialog rather than reading on
     from the page behind it — and hand it back to the frame that opened the
     viewer on the way out, or a keyboard user lands back at the top of the
     document. The instanceof is what makes `opener` focusable: activeElement is
     only ever typed as an Element, which has no focus(). */
  useEffect(() => {
    const opener = document.activeElement;
    panelRef.current?.focus();
    return () => {
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, []);

  if (!n) return null;

  return createPortal(
    <div className={SCRIM} onClick={onClose} role="presentation">
      <div
        className={PANEL}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${category} gallery`}
        tabIndex={-1}
        /* The scrim closes on click; inside the panel it must not. */
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className={CLOSE} aria-label="Close gallery" onClick={onClose}>
          ×
        </button>

        <div className={VIEWER_STAGE} ref={stageRef}>
          <Ring category={category} index={index} onStep={step} sides={1} />
        </div>

        {/* Arrows and dots read as one control: step either side, jump in the
            middle. */}
        <div className="flex items-center gap-[clamp(12px,2vw,22px)]">
          <button
            type="button"
            className={VIEWER_ARROW}
            aria-label="Previous look"
            onClick={() => step(-1)}
          >
            ←
          </button>

          <div className="flex flex-wrap items-center justify-center gap-2.25">
            {shots.map((shot, i) => (
              <button
                key={shot.src}
                type="button"
                className={`${DOT} ${i === active ? DOT_STATE.on : DOT_STATE.off}`}
                aria-label={`${category} look ${i + 1}`}
                aria-current={i === active}
                onClick={() => pick(i)}
              />
            ))}
          </div>

          <button
            type="button"
            className={VIEWER_ARROW}
            aria-label="Next look"
            onClick={() => step(1)}
          >
            →
          </button>
        </div>

        <a className={VIEW_ALL} href={ctaHref}>
          {ctaLabel} <span aria-hidden="true">→</span>
        </a>
      </div>
    </div>,
    document.body,
  );
}
