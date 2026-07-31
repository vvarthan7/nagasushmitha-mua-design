import { useState } from "react";
import { faqs } from "../data.js";
import s from "./Faq.module.css";

export default function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section className={s.section}>
      <div className={s.inner}>
        <div className={s.copy}>
          <p className={s.eyebrow}>Good to know</p>
          <h2 className={s.title}>
            Questions brides ask <em>first</em>
          </h2>
        </div>

        <div className={s.list}>
          {faqs.map((faq, i) => (
            <div key={faq.q} className={s.item}>
              <button
                type="button"
                aria-expanded={open === i}
                className={`${s.question} ${open === i ? s.questionOpen : ""}`}
                onClick={() => setOpen(open === i ? -1 : i)}
              >
                <span className={s.questionText}>{faq.q}</span>
                <span
                  aria-hidden="true"
                  className={`${s.icon} ${open === i ? s.iconOpen : ""}`}
                >
                  +
                </span>
              </button>
              {open === i && <p className={s.answer}>{faq.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
