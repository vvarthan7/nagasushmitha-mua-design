import { useState } from "react";
import { beforeImage, afterImage } from "../data";

const VIEWER = [
  "relative aspect-5/4 cursor-ew-resize touch-pan-y overflow-hidden",
  "rounded-[clamp(14px,2vw,20px)] bg-border-soft",
].join(" ");

export default function BeforeAfter() {
  /** Where the wipe sits, as a percentage of the viewer's width. */
  const [split, setSplit] = useState(56);

  const scrubTo = (clientX: number, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSplit(Math.max(2, Math.min(98, pct)));
  };

  return (
    <section className="bg-blush-soft">
      <div className="mx-auto grid max-w-shell grid-cols-[repeat(auto-fit,minmax(290px,1fr))] items-center gap-[clamp(24px,4vw,44px)] px-gutter py-[clamp(36px,6vw,66px)]">
        <div className="flex flex-col gap-3.25">
          <p className="font-sans text-[10px] tracking-[0.26em] text-rust uppercase">
            Before / after
          </p>
          <h2 className="font-serif text-[clamp(24px,3.6vw,34px)] leading-[1.15] font-normal text-ink [&_em]:text-plum">
            Skin that still looks like <em>your</em> skin
          </h2>
          <p className="max-w-[44ch] font-sans text-[14px] leading-[1.8] text-pretty text-text">
            Drag across the image. No filters, no heavy powder — a base built
            for fourteen hours and every camera in the family.
          </p>
          <p className="font-sans text-[10px] tracking-[0.18em] text-rust uppercase">
            Drag → {Math.round(split)}%
          </p>
        </div>

        <div
          className={VIEWER}
          onMouseMove={(e) => scrubTo(e.clientX, e.currentTarget)}
          onTouchMove={(e) => {
            if (e.touches[0]) scrubTo(e.touches[0].clientX, e.currentTarget);
          }}
        >
          <img
            src={beforeImage}
            alt="Before makeup"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
          >
            <img
              src={afterImage}
              alt="After makeup"
              className="h-full w-full object-cover"
            />
          </div>
          <div
            className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_14px_rgba(44,26,28,0.5)]"
            style={{ left: `${split}%` }}
          />
        </div>
      </div>
    </section>
  );
}
