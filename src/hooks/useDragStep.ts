import { useEffect } from "react";
import type { RefObject } from "react";

/** Drag or swipe a carousel: one step per `threshold` px of travel, then
 *  re-arm, so a long drag keeps moving the ring rather than stopping at one.
 *  Shared by the coverflow on the page and the one in the viewer.
 *
 *  `step` is handed +1 or -1 — the sign is the direction of travel, matching
 *  the signed steps the arrows and the ring itself pass around.
 */
export function useDragStep(
  ref: RefObject<HTMLElement | null>,
  step: (delta: number) => void,
  threshold = 60,
): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let x0: number | null = null;
    const down = (e: PointerEvent) => { x0 = e.clientX; };
    const move = (e: PointerEvent) => {
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
