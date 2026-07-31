import { useState } from "react";
import { quotes } from "../data.js";
import s from "./Testimonials.module.css";

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const current = quotes[index];

  const step = (delta) =>
    setIndex((i) => (i + delta + quotes.length) % quotes.length);

  return (
    <section id="words" className={s.section}>
      <p className={s.eyebrow}>Kind words</p>

      <blockquote className={s.quote}>“{current.quote}”</blockquote>
      <div className={s.attribution}>
        <div className={s.name}>{current.name}</div>
        <div className={s.meta}>{current.meta}</div>
      </div>

      <div className={s.controls}>
        <button
          type="button"
          className={s.arrow}
          aria-label="Previous testimonial"
          onClick={() => step(-1)}
        >
          ←
        </button>

        <div className={s.dots}>
          {quotes.map((quote, i) => (
            <button
              key={quote.name}
              type="button"
              aria-label={`Testimonial ${i + 1}`}
              aria-current={index === i}
              className={`${s.dot} ${index === i ? s.dotActive : ""}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>

        <button
          type="button"
          className={s.arrow}
          aria-label="Next testimonial"
          onClick={() => step(1)}
        >
          →
        </button>
      </div>
    </section>
  );
}
