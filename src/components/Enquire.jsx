import { useState } from "react";
import {
  WHATSAPP_URL,
  INSTAGRAM_URL,
  INSTAGRAM_HANDLE,
  EMAIL,
} from "../data.js";
import s from "./Enquire.module.css";

const FIELDS = [
  { name: "name", placeholder: "Your name" },
  { name: "phone", placeholder: "Phone / WhatsApp" },
  { name: "date", placeholder: "Event date" },
];

export default function Enquire() {
  const [sent, setSent] = useState(false);

  return (
    <section id="enquire" className={s.section}>
      <div className={s.inner}>
        <div className={s.copy}>
          <p className={s.eyebrow}>Enquire</p>
          <h2 className={s.title}>
            Tell me about your <em>day</em>
          </h2>
          <p className={s.body}>
            Dates, venue, bridal party size. I reply within 24 hours — or reach
            me on WhatsApp for anything urgent.
          </p>
          <div className={s.contact}>
            <a href={INSTAGRAM_URL} className={s.contactLink}>
              {INSTAGRAM_HANDLE}
            </a>
            <a href={`mailto:${EMAIL}`} className={s.contactLink}>
              {EMAIL}
            </a>
            <span>Bangalore · travels pan-India</span>
          </div>
        </div>

        {sent ? (
          <div className={s.thanks}>
            <div className={s.thanksTitle}>Thank you</div>
            <p className={s.thanksBody}>
              Your enquiry is in. You&apos;ll hear from me within 24 hours.
            </p>
            <button
              type="button"
              className={s.reset}
              onClick={() => setSent(false)}
            >
              Send another
            </button>
          </div>
        ) : (
          <form
            className={s.form}
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            {FIELDS.map((field) => (
              <input
                key={field.name}
                name={field.name}
                aria-label={field.placeholder}
                placeholder={field.placeholder}
                className={s.input}
              />
            ))}
            <textarea
              name="message"
              rows="4"
              aria-label="Tell me about your vision"
              placeholder="Tell me about your vision"
              className={s.textarea}
            />
            <div className={s.actions}>
              <button type="submit" className={s.submit}>
                Send enquiry
              </button>
              <a href={WHATSAPP_URL} className={s.whatsapp}>
                WhatsApp
              </a>
            </div>
          </form>
        )}
      </div>

      <footer className={s.footer}>
        <div className={s.footerInner}>
          <span>© 2026 Naga Sushmitha</span>
          <span>Bridal · Editorial · Academy — Bangalore</span>
        </div>
      </footer>
    </section>
  );
}
