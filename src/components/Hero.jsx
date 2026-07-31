import { heroImage, heroStats, WHATSAPP_URL } from "../data.js";
import s from "./Hero.module.css";

export default function Hero() {
  return (
    <section id="top" className={s.hero}>
      <div className={s.copy}>
        <p className={s.eyebrow}>Bridal makeup artist · Bangalore</p>
        <h1 className={s.title}>
          Your face, <em>your story</em> — told well.
        </h1>
        <p className={s.lede}>
          Muhurtham, reception, sangeet and the quiet morning before. Makeup,
          hair and saree draping, all from one calm pair of hands.
        </p>

        <div className={s.actions}>
          <a href="#enquire" className={s.primary}>
            Book your date
          </a>
          <a href={WHATSAPP_URL} className={s.secondary}>
            WhatsApp
          </a>
        </div>

        <div className={s.stats}>
          {heroStats.map((stat) => (
            <div key={stat.label} className={s.stat}>
              <div className={s.statValue}>{stat.value}</div>
              <div className={s.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={s.frame}>
        <img
          src={heroImage}
          alt="Bride wearing bridal makeup by Naga Sushmitha"
          className={s.image}
        />
      </div>
    </section>
  );
}
