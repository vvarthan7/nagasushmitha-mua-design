import { useState } from "react";
import { bookingSteps } from "../data.js";
import s from "./BookingSteps.module.css";

export default function BookingSteps() {
  const [active, setActive] = useState(0);

  return (
    <section className={s.section}>
      <div className={s.inner}>
        <header className={s.head}>
          <p className={s.eyebrow}>How it works</p>
          <h2 className={s.title}>Three steps to book</h2>
        </header>

        <div className={s.grid}>
          {bookingSteps.map((step, i) => (
            <article
              key={step.n}
              className={`${s.card} ${active === i ? s.cardActive : ""}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
            >
              <div className={s.number}>{step.n}</div>
              <h3 className={s.cardTitle}>{step.title}</h3>
              <p className={s.cardBody}>{step.body}</p>
            </article>
          ))}
        </div>

        <div className={s.dots} aria-hidden="true">
          {bookingSteps.map((step, i) => (
            <span
              key={step.n}
              className={`${s.dot} ${active === i ? s.dotActive : ""}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
