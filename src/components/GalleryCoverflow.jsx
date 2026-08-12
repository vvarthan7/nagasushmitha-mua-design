import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gallery, galleryFilters } from "../data.js";
import { useDragStep } from "../hooks/useDragStep.js";
import s from "./GalleryCoverflow.module.css";

/**
 * Gallery — pills + coverflow.
 * Hero frame at centre, neighbours shrunk and dimmed, everything sliding
 * through the middle. Arrows, clicking a side frame, dragging, and ← / → all
 * move the ring; the category buttons swap the ring for a different set;
 * clicking the centre frame opens the viewer.
 *
 * Three components, all private to this file: the section, the <Ring> it
 * renders (twice during a set swap), and the <Viewer> overlay — which is the
 * same ring again, on a dark ground.
 */

/* Photos are folder-driven through data.js — drop a file into
   src/assets/bridal or src/assets/editorial and it joins the set. This is a
   teaser, so each set is capped: five cards are on screen at once, and past
   ten the extra frames are payload nobody swipes to. */
const MAX_SHOTS = 10;

/* Card size and the pitch between neighbours are CSS (`--card-w`, `--card-h`,
   `--slot` on the stage), not constants here — the viewer runs bigger frames
   than the page and both have to shrink on small screens, which is a media
   query's job. The transform below multiplies `--slot` by the slot offset. */

/** How many cards flank the centre one. Further out than this they are hidden
 *  and inert. The page shows two either side; the viewer overrides to one, its
 *  frames being large enough that a second pair only crowds them. */
const SIDES = 2;
/** How long the outgoing set stays mounted. Must match .layerOut's animation. */
const SWAP_MS = 460;

/** The photos behind one button, in the order the folder gives them. */
const categoryShots = (category) =>
  gallery.filter((g) => g.category === category).slice(0, MAX_SHOTS);

export default function GalleryCoverflow({
  categories = galleryFilters,
  defaultCategory = galleryFilters[0],
  eyebrow = "Gallery",
  heading = "Look by",
  headingAccent = "look",
  lead = "Bridal chairs, art shoots, prosthetics — the range, as it was shot.",
  ctaLabel = "View more",
  ctaHref = "#",
}) {
  const [category, setCategory] = useState(defaultCategory);
  /* `index` grows unbounded — direction of travel is the sign of the step, so
     going from the last photo to the first still slides forward. */
  const [index, setIndex] = useState(0);
  /* The set on its way out. It stays mounted for the length of the cross-fade,
     holding the index it was left on, so the stage is never empty mid-swap —
     the old photos are still leaving as the new ones arrive. */
  const [leaving, setLeaving] = useState(null);
  /* Which photo the viewer is open on, or null for closed. */
  const [viewing, setViewing] = useState(null);
  const stageRef = useRef(null);

  const step = useCallback((d) => setIndex((i) => i + d), []);
  useDragStep(stageRef, step);

  /* Sets travel the way the row reads: Editorial sits right of Bridal, so it
     pushes in from the right and Bridal leaves to the left. */
  const dir =
    leaving && categories.indexOf(category) < categories.indexOf(leaving.category)
      ? -1
      : 1;

  const showCategory = (name) => {
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

  const onKeyDown = (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
    if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
  };

  return (
    <section id="gallery" className={s.section}>
      <header className={s.head}>
        <p className={s.eyebrow}>{eyebrow}</p>
        <h2 className={s.title}>
          {heading} <em>{headingAccent}</em>
        </h2>
        <p className={s.lead}>{lead}</p>
      </header>

      <div className={s.actions}>
        {categories.map((name) => (
          <button
            key={name}
            type="button"
            aria-pressed={name === category}
            className={`${s.tab} ${name === category ? s.tabOn : ""}`}
            onClick={() => showCategory(name)}
          >
            {name}
          </button>
        ))}
        <a className={s.cta} href={ctaHref}>
          {ctaLabel} <span aria-hidden="true">→</span>
        </a>
      </div>

      <div
        className={s.stage}
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

      <div className={s.nav}>
        <button type="button" className={s.arrow} aria-label="Previous look" onClick={() => step(-1)}>
          ←
        </button>
        <button type="button" className={s.arrow} aria-label="Next look" onClick={() => step(1)}>
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
function Ring({ category, index, dir = 1, exiting = false, onStep, onOpen, sides = SIDES }) {
  const shots = useMemo(() => categoryShots(category), [category]);

  const n = shots.length;
  if (!n) return null;

  /* Two laps is enough once there are 8+ photos; below that, three. */
  const laps = Math.max(2, Math.ceil(15 / n));
  const RING = n * laps;
  const centreSlot = ((index % RING) + RING) % RING;

  /** Signed slot offset from centre, shortest way round the ring. */
  const rel = (slot) => {
    let d = slot - centreSlot;
    while (d > RING / 2) d -= RING;
    while (d < -RING / 2) d += RING;
    return d;
  };

  return (
    <div
      className={`${s.layer} ${exiting ? s.layerOut : s.layerIn}`}
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
        const opens = isCentre && onOpen;
        return (
          <button
            key={slot}
            type="button"
            className={s.card}
            aria-label={`${opens ? "Open " : ""}${category} look ${photo + 1}`}
            aria-hidden={!shown}
            tabIndex={shown && !exiting ? 0 : -1}
            onClick={() => (opens ? onOpen(photo) : onStep?.(r))}
            style={{
              backgroundImage: `url("${shot.src}")`,
              backgroundPosition: shot.position || "center",
              /* Depth of field: the further off centre, the softer and the
                 deeper under the veil (drawn by .card::after, which reads this
                 custom property). */
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

/**
 * Full-screen viewer for one category — the same ring, on a dark ground and
 * without the category buttons: you are already inside a set, so the only
 * travel offered is within it. Arrows flank the frames, dots below jump
 * straight to a photo, and the CTA leaves for the full gallery.
 *
 * Portalled to <body> so no ancestor's stacking or clipping can catch it, and
 * it sits on the same overlay layer as Lightbox (z-index 60).
 */
function Viewer({ category, startAt = 0, onClose, ctaLabel = "View all", ctaHref = "#" }) {
  const [index, setIndex] = useState(startAt);
  const stageRef = useRef(null);
  const panelRef = useRef(null);

  const shots = useMemo(() => categoryShots(category), [category]);
  const n = shots.length;
  const active = ((index % n) + n) % n;

  const step = useCallback((d) => setIndex((i) => i + d), []);
  useDragStep(stageRef, step);

  /** Travel the short way round to a photo rather than jumping to it. */
  const pick = (photo) => {
    let d = photo - active;
    while (d > n / 2) d -= n;
    while (d < -n / 2) d += n;
    step(d);
  };

  /* The overlay owns the keyboard while it is up: Escape leaves, arrows
     travel. Bound to the window rather than the panel so it works wherever
     focus has wandered inside the dialog. */
  useEffect(() => {
    const onKey = (e) => {
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
     document. */
  useEffect(() => {
    const opener = document.activeElement;
    panelRef.current?.focus();
    return () => opener?.focus?.();
  }, []);

  if (!n) return null;

  return createPortal(
    <div className={s.scrim} onClick={onClose} role="presentation">
      <div
        className={s.panel}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${category} gallery`}
        tabIndex={-1}
        /* The scrim closes on click; inside the panel it must not. */
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className={s.close} aria-label="Close gallery" onClick={onClose}>
          ×
        </button>

        <div className={s.viewerStage} ref={stageRef}>
          <Ring category={category} index={index} onStep={step} sides={1} />
        </div>

        {/* Arrows and dots read as one control: step either side, jump in the
            middle. */}
        <div className={s.controls}>
          <button
            type="button"
            className={s.viewerArrow}
            aria-label="Previous look"
            onClick={() => step(-1)}
          >
            ←
          </button>

          <div className={s.dots}>
            {shots.map((shot, i) => (
              <button
                key={shot.src}
                type="button"
                className={`${s.dot} ${i === active ? s.dotOn : ""}`}
                aria-label={`${category} look ${i + 1}`}
                aria-current={i === active}
                onClick={() => pick(i)}
              />
            ))}
          </div>

          <button
            type="button"
            className={s.viewerArrow}
            aria-label="Next look"
            onClick={() => step(1)}
          >
            →
          </button>
        </div>

        <a className={s.viewAll} href={ctaHref}>
          {ctaLabel} <span aria-hidden="true">→</span>
        </a>
      </div>
    </div>,
    document.body,
  );
}
