import { useState } from "react";
import type { ReactNode } from "react";
import { testimonials } from "../data";

const ARROW = [
  "flex h-11.5 w-11.5 cursor-pointer items-center justify-center rounded-full",
  "border border-border bg-transparent font-sans text-[15px] text-plum",
  "transition-all duration-300 ease-soft",
  "hover:border-plum hover:bg-plum hover:text-white",
].join(" ");

/* The active dot stretches into a bar. Width and fill both change, so it is a
   branch rather than a second class — as a pair on one element the stylesheet's
   order, not this file's, would decide which won. */
const DOT = "h-2 rounded-full transition-all duration-350 ease-soft";

/** Splits on *asterisk-wrapped* runs and bolds them. The capture group means
 *  odd indices are the wrapped runs and even ones the plain text between. */
const renderQuote = (text: string): ReactNode[] =>
  text
    .split(/\*([^*]+)\*/g)
    .map((part, i) =>
      i % 2 ? (
        <strong key={i} className="font-bold">
          {part}
        </strong>
      ) : (
        part
      ),
    );

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const current = testimonials[index];

  const step = (delta: number) =>
    setIndex((i) => (i + delta + testimonials.length) % testimonials.length);

  return (
    <section
      id="words"
      className="mx-auto flex max-w-225 scroll-mt-nav-offset flex-col items-center gap-[clamp(16px,2.5vw,22px)] px-gutter py-[clamp(40px,6vw,72px)] text-center"
    >
      <p className="font-sans text-[10px] tracking-[0.26em] text-rust uppercase">
        Kind words
      </p>

      <blockquote className="font-serif text-[clamp(19px,2.8vw,28px)] leading-[1.55] text-pretty text-ink italic">
        “{renderQuote(current.testimonial)}”
      </blockquote>
      <div className="flex flex-col gap-1">
        <div className="font-sans text-[11px] tracking-[0.18em] text-plum uppercase">
          {current.name}
        </div>
        <div className="font-sans text-[10px] tracking-[0.12em] text-meta">
          {current.meta}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className={ARROW}
          aria-label="Previous testimonial"
          onClick={() => step(-1)}
        >
          ←
        </button>

        <div className="flex items-center gap-1.75">
          {testimonials.map((testimonial, i) => (
            <button
              key={testimonial.name}
              type="button"
              aria-label={`Testimonial ${i + 1}`}
              aria-current={index === i}
              className={`${DOT} ${index === i ? "w-6.5 bg-plum" : "w-2 bg-dot"}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>

        <button
          type="button"
          className={ARROW}
          aria-label="Next testimonial"
          onClick={() => step(1)}
        >
          →
        </button>
      </div>
    </section>
  );
}
