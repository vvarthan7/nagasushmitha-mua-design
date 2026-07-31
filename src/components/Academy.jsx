import { academyImage } from "../data.js";
import s from "./Academy.module.css";

export default function Academy() {
  return (
    <section id="courses" className={s.section}>
      <div className={s.inner}>
        <div className={s.copy}>
          <p className={s.eyebrow}>Academy</p>
          <h2 className={s.title}>
            Learn makeup, hair &amp; <em>saree draping</em>
          </h2>
          <p className={s.body}>
            Personal self-makeup sessions and professional courses, taught in
            small groups in Bangalore. A new batch opens each month.
          </p>
          <div className={s.actions}>
            <a href="#enquire" className={s.primary}>
              See courses
            </a>
            <a href="#enquire" className={s.secondary}>
              Syllabus
            </a>
          </div>
        </div>

        <div className={s.frame}>
          <img
            src={academyImage}
            alt="Teaching a makeup masterclass"
            loading="lazy"
            className={s.image}
          />
        </div>
      </div>
    </section>
  );
}
