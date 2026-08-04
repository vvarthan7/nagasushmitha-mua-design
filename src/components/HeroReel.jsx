import { useEffect, useRef, useState } from "react";
import { heroReelFrames } from "../data.js";
import s from "./HeroReel.module.css";

/**
 * Banner 1C — "Reel"
 * Four looks cross-dissolving on a 24s cycle over a slow Ken Burns push-in.
 * Centred wordmark, rule wipes in on load. No JS drives the loop — pure CSS.
 *
 * Swap to real video later: drop a <video autoPlay muted loop playsInline>
 * in place of the frames block. Scrims and wordmark stay as-is.
 */

/* One class per slot in the dissolve cycle, so `heroReelFrames` has to stay
   four long — a fifth photo would come out with no slot and never show. */
const SLOTS = [s.frame1, s.frame2, s.frame3, s.frame4];

export default function HeroReel({
  name = "Naga Sushmitha",
  kicker = "Bridal Makeup Artist",
  height = 620,
}) {
  const ref = useRef(null);
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
      className={`${s.heroReel} ${inView ? "" : s.paused}`}
      style={{ "--hero-h": `${height}px` }}
      aria-label="Naga Sushmitha — bridal and editorial makeup"
    >
      <div className={s.frames}>
        {heroReelFrames.map((f, i) => (
          <div
            key={f.src}
            className={`${s.frame} ${SLOTS[i]}`}
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

      <div className={s.scrim} />
      <div className={s.vignette} />

      <div className={s.body}>
        <h1 className={s.name}>{name}</h1>
        <span className={s.rule} />
        <p className={s.kicker}>{kicker}</p>
      </div>
    </section>
  );
}
