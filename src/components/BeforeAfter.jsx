import { useState } from "react";
import { beforeImage, afterImage } from "../data.js";
import s from "./BeforeAfter.module.css";

export default function BeforeAfter() {
  const [split, setSplit] = useState(56);

  const scrubTo = (clientX, el) => {
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSplit(Math.max(2, Math.min(98, pct)));
  };

  return (
    <section className={s.section}>
      <div className={s.inner}>
        <div className={s.copy}>
          <p className={s.eyebrow}>Before / after</p>
          <h2 className={s.title}>
            Skin that still looks like <em>your</em> skin
          </h2>
          <p className={s.body}>
            Drag across the image. No filters, no heavy powder — a base built
            for fourteen hours and every camera in the family.
          </p>
          <p className={s.readout}>Drag → {Math.round(split)}%</p>
        </div>

        <div
          className={s.viewer}
          onMouseMove={(e) => scrubTo(e.clientX, e.currentTarget)}
          onTouchMove={(e) => {
            if (e.touches[0]) scrubTo(e.touches[0].clientX, e.currentTarget);
          }}
        >
          <img src={beforeImage} alt="Before makeup" className={s.before} />
          <div
            className={s.afterClip}
            style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
          >
            <img src={afterImage} alt="After makeup" className={s.after} />
          </div>
          <div className={s.handle} style={{ left: `${split}%` }} />
        </div>
      </div>
    </section>
  );
}
