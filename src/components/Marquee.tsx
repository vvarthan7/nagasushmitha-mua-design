import { marqueeText } from "../data";

/* animate-marquee and its keyframe live in styles/tailwind.css — the -50%
   endpoint is what the doubled run below is for. */
const TRACK = [
  "flex w-max animate-marquee gap-7 font-sans",
  "text-[clamp(9px,1.2vw,11px)] tracking-[0.28em] text-rust uppercase",
  "motion-reduce:animate-none",
].join(" ");

export default function Marquee() {
  return (
    <div
      className="overflow-hidden border-t border-b border-t-border-soft border-b-border-soft bg-blush-soft py-3.5"
      aria-hidden="true"
    >
      {/* Two identical runs so the -50% keyframe loops seamlessly. */}
      <div className={TRACK}>
        <span>{marqueeText}</span>
        <span>{marqueeText}</span>
      </div>
    </div>
  );
}
