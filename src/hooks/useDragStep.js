import { useEffect } from "react";

/** Drag or swipe a carousel: one step per `threshold` px of travel, then
 *  re-arm, so a long drag keeps moving the ring rather than stopping at one.
 *  Shared by the coverflow on the page and the one in the viewer. */
export function useDragStep(ref, step, threshold = 60) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let x0 = null;
    const down = (e) => { x0 = e.clientX; };
    const move = (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0;
      if (Math.abs(dx) > threshold) { step(dx < 0 ? 1 : -1); x0 = null; }
    };
    const clear = () => { x0 = null; };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", clear);
    el.addEventListener("pointerleave", clear);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", clear);
      el.removeEventListener("pointerleave", clear);
    };
  }, [ref, step, threshold]);
}
