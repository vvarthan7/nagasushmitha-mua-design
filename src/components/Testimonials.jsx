import { useState } from "react";
import { testimonials } from "../data.js";
import s from "./Testimonials.module.css";

const renderQuote = (text) =>
  text
    .split(/\*([^*]+)\*/g)
    .map((part, i) =>
      i % 2 ? (
        <strong key={i} className={s.strong}>
          {part}
        </strong>
      ) : (
        part
      ),
    );

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const current = testimonials[index];

  const step = (delta) =>
    setIndex((i) => (i + delta + testimonials.length) % testimonials.length);

  return (
    <section id="words" className={s.section}>
      <p className={s.eyebrow}>Kind words</p>

      <blockquote className={s.testimonial}>
        “{renderQuote(current.testimonial)}”
      </blockquote>
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
          {testimonials.map((testimonial, i) => (
            <button
              key={testimonial.name}
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
