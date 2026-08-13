import { useEffect, useRef, useState } from "react";
import { heroReelFrames } from "../data";

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
   under 860px, so the landscape frames stop overflowing downwards and start
   overflowing sideways — a different axis to aim, hence a second crop per
   frame. Frames without a `mobilePosition` get their desktop value back, so
   that swap is a no-op for them. */
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

/* The scrim is only 0.12 behind the wordmark, so most of its contrast is still
   carried per-element: a soft dark bloom close to the glyphs. Two shadows
   rather than one — a tight one for edge definition, a wide diffuse one to hold
   the light frames (frame 2 tops out near white). Keeping the work here rather
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
      <div className="absolute inset-0">
        {heroReelFrames.map((f, i) => (
          <div
            key={f.src}
            className={`${FRAME} ${SLOTS[i]}`}
            /* Handed to CSS as custom properties rather than as
               background-position directly: an inline value would outrank the
               media query that swaps in the mobile crop. */
            style={{
              backgroundImage: `url(${f.src})`,
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

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3.5 px-gutter text-center">
        <h1 className={NAME}>{name}</h1>
        <span className={RULE} />
        <p className={KICKER}>{kicker}</p>
      </div>
    </section>
  );
}
