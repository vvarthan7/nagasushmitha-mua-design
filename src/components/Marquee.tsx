/* The strip's own copy. It sat in data.ts with the rest of the page's content,
   but nothing else ever read it — one caller, one string — while data.ts's
   other exports are photographs and structured content that several sections
   share. Here it also keeps this file free of imports, which is what lets
   vite.config.ts render the component to markup at build time; see firstPaint
   there. Nothing else may be imported into this file without checking that. */
const TEXT =
  "Bridal ◆ Muhurtham ◆ Reception ◆ Sangeet ◆ Editorial ◆ Saree draping ◆ Portfolio ◆ Bridal ◆ Muhurtham ◆ Reception ◆ Sangeet ◆ Editorial ◆ Saree draping ◆ Portfolio ◆";

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
        <span>{TEXT}</span>
        <span>{TEXT}</span>
      </div>
    </div>
  );
}
