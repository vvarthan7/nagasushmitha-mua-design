import { useState } from "react";
import { bookingSteps } from "../data";

/* Base type and box for a step card. The lifted state is a branch rather than
   an extra class, because border-colour and box-shadow are set by both halves —
   as two classes on one element the stylesheet's order, not this file's, would
   decide which won. */
const CARD = [
  "flex cursor-default flex-col gap-2.25 rounded-[18px] border bg-white",
  "p-[clamp(18px,3vw,24px)] transition-all duration-350 ease-brand",
].join(" ");

const CARD_STATE = {
  on: "-translate-y-1.5 border-border shadow-[0_18px_36px_rgba(125,54,70,0.14)]",
  off: "border-transparent shadow-[0_1px_0_rgba(125,54,70,0.05)]",
};

/* The active dot stretches into a bar — width and fill both change, so this is
   a branch for the same reason the card is. */
const DOT = "h-1.75 rounded-full transition-all duration-350 ease-soft";

export default function BookingSteps() {
  const [active, setActive] = useState(0);

  return (
    <section id="how-it-works" className="scroll-mt-nav-offset bg-blush">
      <div className="mx-auto flex max-w-shell flex-col gap-[clamp(20px,3vw,28px)] px-gutter py-[clamp(36px,6vw,64px)]">
        <header className="flex flex-col items-center gap-2 text-center">
          <p className="font-sans text-[10px] tracking-[0.26em] text-rust uppercase">
            How it works
          </p>
          <h2 className="font-serif text-[clamp(26px,4vw,38px)] font-normal text-ink">
            Three steps to book
          </h2>
        </header>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-[clamp(12px,2vw,18px)]">
          {bookingSteps.map((step, i) => (
            <article
              key={step.n}
              className={`${CARD} ${active === i ? CARD_STATE.on : CARD_STATE.off}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
            >
              <div className="font-serif text-[clamp(28px,4vw,34px)] text-clay italic">
                {step.n}
              </div>
              <h3 className="font-sans text-[14px] font-bold text-ink">
                {step.title}
              </h3>
              <p className="font-sans text-[13px] leading-[1.7] text-text">
                {step.body}
              </p>
            </article>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2.5" aria-hidden="true">
          {bookingSteps.map((step, i) => (
            <span
              key={step.n}
              className={`${DOT} ${active === i ? "w-7 bg-plum" : "w-1.75 bg-dot"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
