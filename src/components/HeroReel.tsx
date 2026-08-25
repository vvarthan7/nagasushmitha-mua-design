import { useEffect, useState } from "react";
import banner1 from "../assets/banner/NS_Banner_1.webp";
import banner2 from "../assets/banner/NS_Banner_2.webp";
import banner3 from "../assets/banner/NS_Banner_3.webp";
import banner4 from "../assets/banner/NS_Banner_4.webp";
import { blurs } from "../data.blur";
import { WHATSAPP_URL } from "../data";
import type { HeroReelFrame, HeroStat } from "../types";

const FRAMES: HeroReelFrame[] = [
  {
    src: banner1,
    blur: blurs["banner/NS_Banner_1.webp"],
    position: "50% 20%",
    mobilePosition: "68% 20%",
    alt: "Reception look, soft glam with sapphire and diamond jewellery over an ivory beaded saree",
  },
  {
    src: banner2,
    blur: blurs["banner/NS_Banner_2.webp"],
    position: "50% 22%",
    mobilePosition: "88% 22%",
    alt: "Getting ready, smoky eye and deep pink lip with a blue and gold embellished outfit",
  },
  {
    src: banner3,
    blur: blurs["banner/NS_Banner_3.webp"],
    position: "50% 57%",
    mobilePosition: "78% 57%",
    alt: "Bridal portrait in low light, kundan choker and maang tikka with a red embroidered lehenga",
  },
  {
    src: banner4,
    blur: blurs["banner/NS_Banner_4.webp"],
    position: "50% 26%",
    mobilePosition: "14% 26%",
    alt: "Muhurtham look, warm gold eye with temple jewellery, nose ring and a green silk saree",
  },
];

const HERO_STATS: HeroStat[] = [
  { value: "1000+", label: "Brides" },
  { value: "Since 2017", label: "Practice" },
  { value: "Bangalore", label: "Cities" },
];

const SLOTS = [
  "animate-reel-1 motion-reduce:opacity-100",
  "animate-reel-2",
  "animate-reel-3",
  "animate-reel-4",
];

const REEL = [
  "relative h-[var(--hero-h,700px)] min-h-[520px] scroll-mt-nav-offset",
  "overflow-hidden bg-ink",
  "upto-860:h-[min(88svh,700px)]",
].join(" ");

const FRAME = [
  "absolute inset-0 bg-cover bg-no-repeat bg-position-[var(--frame-pos)]",
  "opacity-0 [will-change:opacity,transform]",
  "upto-860:bg-position-[var(--frame-pos-mobile)]",
  "motion-reduce:animate-none",
].join(" ");

const BLUR = [
  "pointer-events-none absolute inset-0 scale-110 blur-lg",
  "bg-cover bg-no-repeat bg-position-[var(--frame-pos)]",
  "upto-860:bg-position-[var(--frame-pos-mobile)]",
  "transition-opacity duration-700 ease-soft",
].join(" ");

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

const STRIP = [
  "absolute inset-x-0 bottom-0 border-t border-white/14",
  "bg-[rgb(44_26_28_/_0.3)] backdrop-blur-[2px]",
].join(" ");

const STRIP_ROW = [
  "mx-auto flex max-w-shell items-center justify-between",
  "gap-[clamp(16px,3vw,40px)] px-gutter py-[clamp(12px,2vw,18px)]",
  "upto-860:flex-col upto-860:items-stretch upto-860:gap-3",
].join(" ");

const STATS = [
  "flex flex-wrap items-baseline gap-x-[clamp(14px,3vw,34px)] gap-y-1",
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

const BOOK = [
  ACTION,
  "bg-white text-plum hover:bg-blush hover:text-plum",
  "upto-860:hidden",
].join(" ");

const WHATSAPP = [
  ACTION,
  "border border-white/55 text-white",
  "hover:border-white hover:bg-white/16 hover:text-white",
  "upto-860:hidden",
].join(" ");

interface HeroReelProps {
  name?: string;
  kicker?: string;
  height?: number;
}

export default function HeroReel({
  name = "Naga Sushmitha",
  kicker = "Makeup - Artist",
  height = 700,
}: HeroReelProps) {
  /* Frame 1, and whether its photograph has landed yet. */
  const cover = FRAMES[0];
  const [coverLoaded, setCoverLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    const settle = () => setCoverLoaded(true);
    img.addEventListener("load", settle);
    img.addEventListener("error", settle);
    img.src = cover.src;
    if (img.complete) settle();
    return () => {
      img.removeEventListener("load", settle);
      img.removeEventListener("error", settle);
    };
  }, [cover.src]);

  return (
    <section
      id="top"
      className={REEL}
      style={{ "--hero-h": `${height}px` }}
      aria-label="Naga Sushmitha — bridal and editorial makeup"
    >
      <div
        aria-hidden
        style={{
          backgroundImage: `url("${cover.blur}")`,
          "--frame-pos": cover.position,
          "--frame-pos-mobile": cover.mobilePosition ?? cover.position,
        }}
        className={`${BLUR} ${coverLoaded ? "opacity-0" : "opacity-100"}`}
      />

      <div className="absolute inset-0">
        {FRAMES.map((f, i) => (
          <div
            key={f.src}
            className={`${FRAME} ${SLOTS[i]}`}
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

      <div className="hero-scrim absolute inset-0" />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3.5 px-gutter pb-[clamp(76px,9vw,96px)] text-center upto-860:pb-[118px]">
        <h1 className={NAME}>{name}</h1>
        <span className={RULE} />
        <p className={KICKER}>{kicker}</p>
      </div>

      <div className={STRIP}>
        <div className={STRIP_ROW}>
          <div className={STATS}>
            {HERO_STATS.slice(0, 2).map((stat, i) => (
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
