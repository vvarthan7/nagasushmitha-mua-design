import { useEffect, useRef, useState } from "react";
import { heroReelFrames, heroStats, WHATSAPP_URL } from "../data";

/**
 * Banner 1C — "Reel"
 * Four looks cross-dissolving on a 24s cycle over a slow Ken Burns push-in.
 * Centred wordmark, rule wipes in on load. No JS drives the loop — pure CSS.
 *
 * One light scrim sits over the frames, carrying both the wordmark here and the
 * transparent nav drawn on top of the banner — Nav paints nothing of its own,
 * so this is the only thing behind those links. The gradient and every keyframe
 * below live in styles/tailwind.css (hero-scrim, animate-reel-*).
 *
 * Swap to real video later: drop a <video autoPlay muted loop playsInline>
 * in place of the frames block. Scrim and wordmark stay as-is.
 */

/* One class per slot in the dissolve cycle, so `heroReelFrames` has to stay
   four long — a fifth photo would come out with no slot and never show. Each
   animate-reel-* pairs that frame's Ken Burns push with its dissolve; all four
   durations must match or the frames desync. Slot 1 is also the frame reduced
   motion freezes on, which is why it alone carries the opacity override. */
const SLOTS = [
  "animate-reel-1 motion-reduce:opacity-100",
  "animate-reel-2",
  "animate-reel-3",
  "animate-reel-4",
];

/* Fallback tracks the `height` default below — the frame crops in data.ts are
   tuned against it, so the two must not drift apart. The banner turns portrait
   under 860px, and at phone widths every frame then overflows sideways rather
   than downwards — a different axis to aim, hence a second crop per frame.
   Frames without a `mobilePosition` get their desktop value back, so that
   swap is a no-op for them. */
const REEL = [
  "group relative h-[var(--hero-h,700px)] min-h-[520px] scroll-mt-nav-offset",
  "overflow-hidden bg-ink",
  "upto-860:h-[min(88svh,700px)]",
].join(" ");

const FRAME = [
  "absolute inset-0 bg-cover bg-no-repeat bg-position-[var(--frame-pos)]",
  "opacity-0 [will-change:opacity,transform]",
  "upto-860:bg-position-[var(--frame-pos-mobile)]",
  /* Paused off-screen, driven by the IntersectionObserver below. */
  "group-data-[paused=true]:[animation-play-state:paused]",
  "motion-reduce:animate-none",
].join(" ");

/* The blur-up held under frame 1 until the photograph itself arrives.

   The banner is the first thing on the page and its frames are the largest
   files the site ships, so the gap between first paint and frame 1 landing is
   real — flat ink for a second or more on a cold connection. This fills it
   with that frame's 20px placeholder, scaled up and blurred, which is the same
   trick the portfolio tiles use and costs a few hundred inline bytes.

   One layer, for frame 1 only. The cycle opens on it — hr-x1 is opaque at 0% —
   and every later frame cross-dissolves out of the one before rather than out
   of nothing, so frame 1 is the only one that can ever be asked to paint over
   an empty banner. Giving each frame its own backing would also break the
   dissolve: a translucent frame with an opaque blur behind it stops the frame
   before it from showing through at all.

   `scale-110` for the reason Portfolio spells out — blur() samples past the
   element's edge, finds nothing there, and fades to transparent at its own
   border. Oversizing pushes that halo outside the section's clipped box. */
const BLUR = [
  "pointer-events-none absolute inset-0 scale-110 blur-lg",
  "bg-cover bg-no-repeat bg-position-[var(--frame-pos)]",
  "upto-860:bg-position-[var(--frame-pos-mobile)]",
  "transition-opacity duration-700 ease-soft",
].join(" ");

/* The scrim is only 0.12 behind the wordmark, so most of its contrast is still
   carried per-element: a soft dark bloom close to the glyphs. Two shadows
   rather than one — a tight one for edge definition, a wide diffuse one to hold
   the light frames (frame 4 tops out near white). Keeping the work here rather
   than in the scrim is what lets the scrim stay light enough not to flatten the
   photography. */
const NAME = [
  "font-serif text-[clamp(38px,6vw,76px)] leading-[1.05] font-normal",
  "tracking-[-0.01em] text-balance text-white",
  "[text-shadow:0_1px_3px_rgb(44_26_28_/_0.45),0_6px_34px_rgb(44_26_28_/_0.55)]",
].join(" ");

const RULE = [
  "h-px w-[180px] max-w-[60vw] origin-center animate-hairline bg-white/85",
  "shadow-[0_1px_6px_rgb(44_26_28_/_0.5)]",
  "motion-reduce:animate-none motion-reduce:scale-x-100",
].join(" ");

const KICKER = [
  "font-sans text-[15px] font-bold tracking-[0.34em] text-white/92 uppercase",
  "[text-shadow:0_1px_3px_rgb(44_26_28_/_0.5),0_4px_22px_rgb(44_26_28_/_0.55)]",
  "upto-860:tracking-[0.24em]",
].join(" ");

/* ── Bottom strip ──────────────────────────────────────────────────────────
   The proof and both actions ride one full-width band pinned to the banner's
   bottom edge. Its tint is deliberately light — 0.3 of ink, over the 0.24 the
   scrim already holds down there — so the photograph keeps reading through the
   band rather than ending in a solid bar. The rest of the contrast is carried
   per element by the shadows below, the same split the wordmark uses, and that
   is what lets the tint stay this low.

   The hairline is the one hard edge: without it the band's top dissolves into
   the scrim and the whole thing reads as a smudge rather than a strip. */
const STRIP = [
  "absolute inset-x-0 bottom-0 border-t border-white/14",
  "bg-[rgb(44_26_28_/_0.3)] backdrop-blur-[2px]",
].join(" ");

/* Below 860 the row becomes two stacked ones — proof, then a single
   full-width action — which is also what sets the taller bottom padding on
   the wordmark block. */
const STRIP_ROW = [
  "mx-auto flex max-w-shell items-center justify-between",
  "gap-[clamp(16px,3vw,40px)] px-gutter py-[clamp(12px,2vw,18px)]",
  "upto-860:flex-col upto-860:items-stretch upto-860:gap-3",
].join(" ");

const STATS = [
  "flex flex-wrap items-baseline gap-x-[clamp(14px,3vw,34px)] gap-y-1",
  /* Stacked, the pair gets the band's full width and sits at its two ends —
     the same edge-to-edge reading the row has above 860. */
  "upto-860:w-full upto-860:justify-between",
].join(" ");

const STAT_VALUE = [
  "font-serif text-[clamp(23px,3vw,34px)] leading-none text-white",
  "[text-shadow:0_1px_3px_rgb(44_26_28_/_0.5),0_4px_20px_rgb(44_26_28_/_0.45)]",
].join(" ");

const STAT_LABEL = [
  "font-sans text-[10px] font-semibold tracking-[0.2em] text-white/78",
  "uppercase [text-shadow:0_1px_3px_rgb(44_26_28_/_0.5)]",
].join(" ");

const ACTION = [
  "rounded-full px-[clamp(20px,2.4vw,30px)] py-3 text-center font-sans",
  "text-[11px] font-semibold tracking-[0.14em] whitespace-nowrap uppercase",
  "transition-all duration-300 ease-soft",
].join(" ");

/* White fill for the reason Nav's Enquire pill is white over the banner: a
   plum fill sinks into the photography. */
const BOOK = [
  ACTION,
  "bg-white text-plum hover:bg-blush hover:text-plum",
  "upto-860:hidden",
].join(" ");

/* Outlined rather than filled on desktop — two solid pills side by side read
   as one block, and this is the lighter of the two actions there.

   Hidden below 860 rather than promoted to full width: WhatsAppFab now shows
   itself on load on mobile, so the strip would otherwise be offering the same
   action twice on a phone. */
const WHATSAPP = [
  ACTION,
  "border border-white/55 text-white",
  "hover:border-white hover:bg-white/16 hover:text-white",
  "upto-860:hidden",
].join(" ");

interface HeroReelProps {
  name?: string;
  kicker?: string;
  /** Banner height in px. The per-photo Y crops in `heroReelFrames` are tuned
   *  against 700 — see the note above them in data.ts before changing this. */
  height?: number;
}

export default function HeroReel({
  name = "Naga Sushmitha",
  kicker = "Makeup - Artist",
  height = 700,
}: HeroReelProps) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(true);

  /* Frame 1, and whether its photograph has landed yet. */
  const cover = heroReelFrames[0];
  const [coverLoaded, setCoverLoaded] = useState(false);

  /* The frames are background-images on a div, so there is no onLoad to hang
     this on. Asking for the same URL through an Image() is not a second
     request — it is the same cache entry, so this reads the answer to a fetch
     the browser is already making. */
  useEffect(() => {
    const img = new Image();
    const settle = () => setCoverLoaded(true);
    img.addEventListener("load", settle);
    /* Settled on error as well: a placeholder left standing over a photograph
       that is never coming is worse than whatever the broken frame shows. */
    img.addEventListener("error", settle);
    img.src = cover.src;
    /* A cached photo can be complete before those listeners are attached, in
       which case neither event ever fires. */
    if (img.complete) settle();
    return () => {
      img.removeEventListener("load", settle);
      img.removeEventListener("error", settle);
    };
  }, [cover.src]);

  // Pause the cycle when the banner scrolls out of view — saves paint work.
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: 0.05,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="top"
      ref={ref}
      className={REEL}
      data-paused={!inView}
      style={{ "--hero-h": `${height}px` }}
      aria-label="Naga Sushmitha — bridal and editorial makeup"
    >
      {/* Under the frames, so frame 1 fading in covers it and the ones after
          never see it. */}
      <div
        aria-hidden
        style={{
          backgroundImage: `url("${cover.blur}")`,
          "--frame-pos": cover.position,
          "--frame-pos-mobile": cover.mobilePosition ?? cover.position,
        }}
        className={`${BLUR} ${coverLoaded ? "opacity-0" : "opacity-100"}`}
      />

      {/* All four are in the tree from the start, so the dissolve cycle runs in
          phase from one clock — mounting the later ones late would start their
          keyframes late and walk them out of step with frame 1. What waits is
          only the URL: frames 2, 3 and 4 are not due on screen for 6, 12 and 18
          seconds, and asking for them now means four photographs sharing the
          connection while the one that decides LCP is still coming down it. So
          they are asked for the moment frame 1 has landed, which on a slow
          connection is the difference between the banner arriving in two
          seconds and in twenty. They are transparent until then and there is
          nothing to see either way. */}
      <div className="absolute inset-0">
        {heroReelFrames.map((f, i) => (
          <div
            key={f.src}
            className={`${FRAME} ${SLOTS[i]}`}
            /* Handed to CSS as custom properties rather than as
               background-position directly: an inline value would outrank the
               media query that swaps in the mobile crop. */
            style={{
              backgroundImage:
                i === 0 || coverLoaded ? `url(${f.src})` : undefined,
              "--frame-pos": f.position,
              "--frame-pos-mobile": f.mobilePosition ?? f.position,
            }}
            role="img"
            aria-label={f.alt}
          />
        ))}
      </div>

      {/* Above the frames, below the wordmark — source order is what layers
          these three, none of them carries a z-index. */}
      <div className="hero-scrim absolute inset-0" />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3.5 px-gutter pb-[clamp(76px,9vw,96px)] text-center upto-860:pb-[118px]">
        <h1 className={NAME}>{name}</h1>
        <span className={RULE} />
        <p className={KICKER}>{kicker}</p>
      </div>

      {/* Last in source order: the band paints over the scrim and over the
          wordmark block, whose bottom padding is what keeps the two from
          meeting.

          Two stats rather than the three heroStats holds — the third is the
          one the band has no room for on a phone. The values themselves live
          in data.ts.

          Only the first keeps its label: "Since 2017" already says what it is,
          and the word after it is one the band cannot afford at the width it
          has on a phone. */}
      <div className={STRIP}>
        <div className={STRIP_ROW}>
          <div className={STATS}>
            {heroStats.slice(0, 2).map((stat, i) => (
              <p key={stat.label} className="flex items-baseline gap-2">
                <span className={STAT_VALUE}>{stat.value}</span>
                {i === 0 && <span className={STAT_LABEL}>{stat.label}</span>}
              </p>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <a href="#enquire" className={BOOK}>
              Book your date
            </a>
            <a
              href={WHATSAPP_URL}
              className={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
