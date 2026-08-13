import { useState } from "react";
import { WHATSAPP_URL, INSTAGRAM_URL, INSTAGRAM_HANDLE, EMAIL } from "../data";

/** The single-line fields, in order. The placeholder doubles as the aria-label,
 *  there being no visible <label> in this layout. */
interface EnquiryField {
  name: string;
  placeholder: string;
}

const FIELDS: EnquiryField[] = [
  { name: "name", placeholder: "Your name" },
  { name: "phone", placeholder: "Phone / WhatsApp" },
  { name: "date", placeholder: "Event date" },
];

/* ── Form ─────────────────────────────────────────────────────────────── */
const FIELD = [
  "border border-field-border bg-field px-4.5 py-3.75 font-sans",
  "text-[14px] text-white outline-none",
  "transition-[border-color] duration-250 ease-soft focus:border-clay",
].join(" ");

const BUTTON = [
  "font-sans text-[11px] font-semibold tracking-[0.14em] uppercase",
  "rounded-full transition-all duration-300 ease-soft",
].join(" ");

const SUBMIT = [
  BUTTON,
  "flex-[1_1_180px] cursor-pointer bg-clay p-4 text-ink hover:bg-white",
].join(" ");

/* hover:text-on-dark-strong pins the colour — without it the base-layer a:hover
   rule would recolour this to rust. */
const WHATSAPP = [
  BUTTON,
  "border border-field-border px-6 py-3.75 text-center text-on-dark-strong",
  "hover:border-clay hover:text-on-dark-strong",
].join(" ");

export default function Enquire() {
  const [sent, setSent] = useState(false);

  return (
    <section id="enquire" className="scroll-mt-nav-offset bg-ink">
      <div className="mx-auto grid max-w-shell grid-cols-[repeat(auto-fit,minmax(290px,1fr))] gap-[clamp(26px,4vw,48px)] px-gutter py-[clamp(40px,6vw,72px)]">
        <div className="flex flex-col gap-3.75">
          <p className="font-sans text-[10px] tracking-[0.26em] text-clay uppercase">
            Enquire
          </p>
          <h2 className="font-serif text-[clamp(26px,4vw,38px)] leading-[1.1] font-normal text-white [&_em]:text-clay">
            Tell me about your <em>day</em>
          </h2>
          <p className="max-w-[42ch] font-sans text-[14px] leading-[1.8] text-pretty text-on-dark">
            Dates, venue, bridal party size. I reply within 24 hours — or reach
            me on WhatsApp for anything urgent.
          </p>
          <div className="mt-2 flex flex-col gap-2.25 font-sans text-[13px] text-on-dark-strong">
            <a
              href={INSTAGRAM_URL}
              className="text-on-dark-strong hover:text-clay"
            >
              {INSTAGRAM_HANDLE}
            </a>
            <a
              href={`mailto:${EMAIL}`}
              className="text-on-dark-strong hover:text-clay"
            >
              {EMAIL}
            </a>
            <span>Bangalore · travels pan-India</span>
          </div>
        </div>

        {sent ? (
          <div className="flex flex-col justify-center gap-3.25 rounded-[20px] border border-plum bg-field p-[clamp(24px,4vw,36px)]">
            <div className="font-serif text-[clamp(22px,3vw,28px)] text-white italic">
              Thank you
            </div>
            <p className="font-sans text-[14px] leading-[1.7] text-on-dark">
              Your enquiry is in. You&apos;ll hear from me within 24 hours.
            </p>
            <button
              type="button"
              className="w-fit cursor-pointer border-b border-b-plum bg-transparent pb-1 font-sans text-[10px] tracking-[0.16em] text-clay uppercase"
              onClick={() => setSent(false)}
            >
              Send another
            </button>
          </div>
        ) : (
          <form
            className="flex flex-col gap-2.75"
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
                className={`${FIELD} rounded-full`}
              />
            ))}
            <textarea
              name="message"
              rows={4}
              aria-label="Tell me about your vision"
              placeholder="Tell me about your vision"
              className={`${FIELD} resize-y rounded-[20px]`}
            />
            <div className="flex flex-wrap gap-2.5">
              <button type="submit" className={SUBMIT}>
                Send enquiry
              </button>
              <a href={WHATSAPP_URL} className={WHATSAPP}>
                WhatsApp
              </a>
            </div>
          </form>
        )}
      </div>

      <footer className="border-t border-footer-border">
        <div className="mx-auto flex max-w-shell flex-wrap items-center justify-between gap-3 px-gutter py-6 font-sans text-[10px] tracking-[0.14em] text-footer-text uppercase">
          <span>© 2026 Naga Sushmitha</span>
          <span>Bridal · Editorial · Academy — Bangalore</span>
        </div>
      </footer>
    </section>
  );
}
