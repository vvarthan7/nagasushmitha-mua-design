import { aboutImage } from "../data.js";
import s from "./AboutSection.module.css";

/**
 * About section — option 2A "Portrait + three beats"
 * Arched portrait left, three labelled beats as a hairline list right.
 * Sits directly under <HeroReel />.
 */

const BEATS = [
  {
    label: "The evolution",
    body: "Self-taught from 2014, then levelled up through elite masterclasses with international beauty icons — where the high-end technical precision came from.",
  },
  {
    label: "The reach",
    body: "Based in Bangalore, backed by an expert team — glamming thousands of clients every year.",
  },
  {
    label: "The vibe",
    body: "Effortless glam that highlights your natural features — never masks them.",
  },
];

export default function AboutSection({
  image = aboutImage,
  imageAlt = "Naga Sushmitha holding a red rose",
  eyebrow = "About Sushmitha",
  ctaLabel = "See her work",
  ctaHref = "#gallery",
}) {
  return (
    <section className={s.section} aria-labelledby="about-heading">
      <div className={s.inner}>
        <figure className={s.figure}>
          <span className={s.frame} aria-hidden="true" />
          <div className={s.arch}>
            <img className={s.img} src={image} alt={imageAlt} loading="lazy" />
          </div>
        </figure>

        <div className={s.body}>
          <div className={s.lead}>
            <p className={s.eyebrow}>{eyebrow}</p>
            <h2 className={s.heading} id="about-heading">
              Your beauty, <em>amplified</em>.
            </h2>
          </div>

          <dl className={s.beats}>
            {BEATS.map((b) => (
              <div className={s.beat} key={b.label}>
                <dt className={s.label}>{b.label}</dt>
                <dd className={s.text}>{b.body}</dd>
              </div>
            ))}
          </dl>

          <a className={s.cta} href={ctaHref}>
            {ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
