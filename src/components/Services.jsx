import { useState } from "react";
import { services } from "../data.js";
import s from "./Services.module.css";

export default function Services() {
  const [active, setActive] = useState(0);
  const service = services[active];

  return (
    <section id="services" className={s.section}>
      <h2 className={s.title}>What we do</h2>

      <div className={s.tabs} role="tablist">
        {services.map((item, i) => (
          <button
            key={item.name}
            type="button"
            role="tab"
            aria-selected={active === i}
            className={`${s.tab} ${active === i ? s.tabOn : ""}`}
            onClick={() => setActive(i)}
          >
            {item.name}
          </button>
        ))}
      </div>

      <div className={s.panel}>
        <div className={s.copy}>
          <h3 className={s.panelTitle}>{service.title}</h3>
          <p className={s.body}>{service.body}</p>
          <div className={s.pills}>
            {service.pills.map((pill) => (
              <span key={pill} className={s.pill}>
                {pill}
              </span>
            ))}
          </div>
          <a href="#enquire" className={s.link}>
            Enquire about this →
          </a>
        </div>

        <div className={s.frame}>
          <div
            role="img"
            aria-label={service.title}
            className={s.image}
            style={{ backgroundImage: `url("${service.image}")` }}
          />
        </div>
      </div>
    </section>
  );
}
