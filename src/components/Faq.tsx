import { useState } from "react";
import { faqs } from "../data";

/** Index of the open answer, or -1 for all closed. */
const NONE_OPEN = -1;

/* The open row recolours, so the colour is a branch rather than a second class
   on top of the closed one. */
const QUESTION = [
  "flex w-full cursor-pointer items-center gap-3.5 bg-transparent py-4.5",
  "text-left transition-[color] duration-280 ease-soft",
].join(" ");

export default function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section className="bg-blush">
      <div className="mx-auto grid max-w-shell grid-cols-[repeat(auto-fit,minmax(280px,1fr))] items-start gap-[clamp(22px,4vw,44px)] px-gutter py-[clamp(36px,6vw,66px)]">
        <div className="flex flex-col gap-2.5">
          <p className="font-sans text-[10px] tracking-[0.26em] text-rust uppercase">
            Good to know
          </p>
          <h2 className="font-serif text-[clamp(24px,3.6vw,34px)] leading-[1.15] font-normal text-ink [&_em]:text-plum">
            Questions brides ask <em>first</em>
          </h2>
        </div>

        <div className="flex flex-col">
          {faqs.map((faq, i) => (
            <div key={faq.q} className="border-b border-border-faq">
              <button
                type="button"
                aria-expanded={open === i}
                className={`${QUESTION} ${open === i ? "text-plum" : "text-ink"}`}
                onClick={() => setOpen(open === i ? NONE_OPEN : i)}
              >
                <span className="flex-1 font-sans text-[14px] font-semibold">
                  {faq.q}
                </span>
                <span
                  aria-hidden="true"
                  className={`font-sans text-[17px] text-rust transition-transform duration-300 ease-brand ${
                    open === i ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </button>
              {open === i && (
                <p className="max-w-[52ch] pb-4.5 font-sans text-[13px] leading-[1.8] text-pretty text-text">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
