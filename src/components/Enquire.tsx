import { useRef, useState, type FormEvent } from "react";
import { INSTAGRAM_URL, INSTAGRAM_HANDLE, EMAIL } from "../data";

/** The single-line fields, in order. The placeholder doubles as the aria-label,
 *  there being no visible <label> in this layout. The event date is not among
 *  them — it carries its own picker and validation, further down. */
interface EnquiryField {
  name: string;
  placeholder: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}

const FIELDS: EnquiryField[] = [
  {
    name: "name",
    placeholder: "Your name",
    autoComplete: "name",
    required: true,
  },
  {
    name: "phone",
    placeholder: "Phone",
    type: "tel",
    autoComplete: "tel",
    required: true,
  },
];

/** The handler in functions/api/enquiry.ts, which is what holds the Resend
 *  key. Root-relative rather than following Vite's relative `base`: the Worker
 *  routes this one path itself and serves the static files around it. */
const ENDPOINT = "/api/enquiry";

const FALLBACK_ERROR =
  "Something went wrong sending that. Please try WhatsApp, or email me directly.";

type Status = "idle" | "sending" | "sent" | "error";

/* ── Event date ────────────────────────────────────────────────────────────
   A bare <input type="date"> would be fewer moving parts, but it cannot do
   what this field needs: `placeholder` is ignored on it, and the format it
   displays follows the browser locale, so a visitor in the US is shown
   MM/DD/YYYY with no way to override it. What the bride types into is
   therefore a text input formatted here, and the native picker rides along
   behind the calendar button purely as a way of choosing a day.
   ────────────────────────────────────────────────────────────────────────── */

const DATE_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/;

/** Digits in, DD/MM/YYYY out, with the slashes appearing only once the digits
 *  around them exist — so backspacing over one takes the digit before it too,
 *  instead of leaving the cursor stuck behind a slash it cannot delete. */
function formatTyped(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
    .filter(Boolean)
    .join("/");
}

/** Midnight today, so "in the future" is a comparison of whole days rather
 *  than one against the current time — an event later today is still today. */
function startOfToday(): Date {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

/** The earliest date the picker will offer: tomorrow. */
function firstAllowedDate(): Date {
  const date = startOfToday();
  date.setDate(date.getDate() + 1);
  return date;
}

/** A Date as the YYYY-MM-DD a date input expects. Built by hand rather than
 *  sliced off toISOString(), which converts to UTC first and so lands on the
 *  previous day for everyone east of Greenwich — India included. */
function toInputValue(date: Date): string {
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** The typed text as a real date, or null if it is not one. */
function parseTyped(value: string): Date | null {
  const match = DATE_PATTERN.exec(value);
  if (!match) return null;

  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  /* new Date(2027, 1, 31) rolls quietly over into 3 March, so 31/02/2027 would
     otherwise be accepted as a date nobody meant. Only a value that survives
     the round trip is real. */
  const survivesRoundTrip =
    date.getDate() === Number(day) &&
    date.getMonth() === Number(month) - 1 &&
    date.getFullYear() === Number(year);

  return survivesRoundTrip ? date : null;
}

/** The problem with the field, or "" when there is none. The date is optional,
 *  so blank passes; anything filled in has to be a real day after today. */
function validateDate(value: string): string {
  if (!value) return "";
  if (!DATE_PATTERN.test(value)) return "Please write the date as DD/MM/YYYY.";

  const date = parseTyped(value);
  if (!date) return "That day does not exist — please check the day and month.";
  if (date <= startOfToday()) return "The event date needs to be after today.";

  return "";
}

/* ── Form ─────────────────────────────────────────────────────────────── */

/* Horizontal padding is set per use rather than living here: the date field
   holds its calendar button inside its own right edge and so needs an
   asymmetric pl/pr, which a shared px- would collide with.

   The jump to 16px on phones is not a design choice. Safari on iOS zooms the
   whole viewport in when a focused field's text is under 16px, and since the
   page sets `initial-scale=1` with no maximum-scale — rightly, pinch-zoom
   being an accessibility need — 16px is the only lever that stops it. Left at
   14px, tapping any field here would shunt the layout sideways and leave the
   visitor to pinch their way back out; on the date field it also drags the
   calendar half off-screen. */
const FIELD = [
  "border border-field-border bg-field py-3.75 font-sans",
  "text-[14px] upto-860:text-[16px] text-white outline-none",
  "transition-[border-color] duration-250 ease-soft focus:border-clay",
].join(" ");

/* Attribute selectors outrank the plain class the border colour comes from, so
   an invalid field turns rust whichever order Tailwind happens to emit the two
   rules in — and stays rust while focused, which focus:border-clay alone would
   undo. */
const FIELD_INVALID = [
  "aria-[invalid=true]:border-rust",
  "aria-[invalid=true]:focus:border-rust",
].join(" ");

const BUTTON = [
  "font-sans text-[11px] font-semibold tracking-[0.14em] uppercase",
  "rounded-full transition-all duration-300 ease-soft",
].join(" ");

const SUBMIT = [
  BUTTON,
  "flex-[1_1_180px] cursor-pointer bg-clay p-4 text-ink hover:bg-white",
  "disabled:cursor-wait disabled:bg-clay/60 disabled:hover:bg-clay/60",
].join(" ");

/* The quiet twin of SUBMIT. No colour pin here, unlike the WhatsApp link this
   replaced — the base-layer a:hover rule that made one necessary only ever
   applied to anchors. */
const RESET = [
  BUTTON,
  "cursor-pointer border border-field-border px-6 py-3.75 text-on-dark",
  "hover:border-clay hover:text-on-dark-strong",
].join(" ");

export default function Enquire() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [date, setDate] = useState("");
  const [dateError, setDateError] = useState("");
  const pickerRef = useRef<HTMLInputElement>(null);

  /* Recomputed each render rather than at module load, so a tab left open
     overnight does not go on offering yesterday's "tomorrow". */
  const parsedDate = parseTyped(date);

  function openPicker() {
    const picker = pickerRef.current;
    if (!picker) return;

    /* showPicker() is the only supported way to open the calendar from another
       element. Where it is missing — Safari before 16, chiefly — focusing the
       input is what opens the wheel on iOS, and the click is there for engines
       that want one. Both need the input to be in the layout, which is why it
       is transparent rather than display:none. */
    if (typeof picker.showPicker !== "function") {
      picker.focus();
      picker.click();
      return;
    }

    try {
      picker.showPicker();
    } catch {
      /* The one caller is a click, so the gesture requirement is met and this
         should not fire. It is caught rather than left to throw because the
         alternative is an uncaught error inside an event handler, and a
         calendar that will not open is not worth that. Typing still works. */
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    /* Checked here as well as on blur: a date typed and submitted straight
       from the keyboard never blurs, and the picker's `min` only constrains
       what can be clicked, not what can be typed. */
    const dateProblem = validateDate(date);
    if (dateProblem) {
      setDateError(dateProblem);
      return;
    }

    /* Read the fields before the first await — React clears currentTarget once
       the handler yields. The honeypot rides along with the rest. */
    const values = Object.fromEntries(new FormData(event.currentTarget));

    setStatus("sending");
    setError("");

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });

      /* A gateway error arrives as HTML, so a bare .json() would throw past the
         real status and report a network fault instead of a send failure. */
      const result: { error?: string } = await response
        .json()
        .catch(() => ({}));
      if (!response.ok) throw new Error(result.error || FALLBACK_ERROR);

      setStatus("sent");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : FALLBACK_ERROR);
      setStatus("error");
    }
  }

  /** The form is remounted fresh, but the date lives in state up here and so
   *  has to be cleared by hand. */
  function sendAnother() {
    setStatus("idle");
    setDate("");
    setDateError("");
  }

  /** Runs after the reset button has already blanked the uncontrolled fields.
   *  Only the date and the two error messages are React's to clear — a native
   *  reset cannot touch either, the date being a controlled input. */
  function clearForm() {
    setDate("");
    setDateError("");
    setError("");
    setStatus("idle");
  }

  const sending = status === "sending";

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

        {status === "sent" ? (
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
              onClick={sendAnother}
            >
              Send another
            </button>
          </div>
        ) : (
          <form
            className="flex flex-col gap-2.75"
            onSubmit={submit}
            onReset={clearForm}
          >
            {FIELDS.map((field) => (
              <input
                key={field.name}
                name={field.name}
                type={field.type ?? "text"}
                autoComplete={field.autoComplete}
                required={field.required}
                aria-label={field.placeholder}
                placeholder={field.placeholder}
                className={`${FIELD} rounded-full px-4.5`}
              />
            ))}

            <div className="flex flex-col gap-1.5">
              <div className="relative">
                <input
                  name="date"
                  type="text"
                  inputMode="numeric"
                  /* An autofill dropdown would land on top of the calendar on
                     a phone, where there is no room for both. */
                  autoComplete="off"
                  value={date}
                  onChange={(event) => {
                    setDate(formatTyped(event.target.value));
                    setDateError("");
                  }}
                  onBlur={() => setDateError(validateDate(date))}
                  placeholder="Event date — DD/MM/YYYY"
                  aria-label="Event date in DD/MM/YYYY"
                  aria-invalid={dateError ? true : undefined}
                  aria-describedby={
                    dateError ? "enquiry-date-error" : undefined
                  }
                  aria-errormessage={
                    dateError ? "enquiry-date-error" : undefined
                  }
                  className={`${FIELD} ${FIELD_INVALID} w-full rounded-full pr-12 pl-4.5`}
                />

                {/* The real picker. Transparent and out of the tab order, but
                    left in the layout and sized to the field so its popup
                    anchors under it rather than in the corner of the page.
                    `min` is what keeps today and everything before it
                    unselectable; typed dates are caught by validateDate. */}
                <input
                  ref={pickerRef}
                  type="date"
                  tabIndex={-1}
                  aria-hidden="true"
                  min={toInputValue(firstAllowedDate())}
                  value={parsedDate ? toInputValue(parsedDate) : ""}
                  onChange={(event) => {
                    const [year, month, day] = event.target.value.split("-");
                    if (!day) return;
                    setDate(`${day}/${month}/${year}`);
                    setDateError("");
                  }}
                  className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
                />

                {/* p-3.5 against right-1 rather than a bare icon at right-4.5:
                    the padding grows the tap target to 44px square — the size
                    the burger in Nav already uses — while leaving the glyph
                    exactly where it sat. A 16px icon is a miss waiting to
                    happen on a phone, and this is the control mobile visitors
                    lean on most. It stops at the input's 48px pr, so it never
                    overlaps the typed date. */}
                <button
                  type="button"
                  onClick={openPicker}
                  aria-label="Choose the event date from a calendar"
                  className="absolute top-1/2 right-1 flex -translate-y-1/2 cursor-pointer p-3.5 text-on-dark transition-colors duration-250 ease-soft hover:text-clay"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <rect x="2" y="3.5" width="12" height="11" rx="2" />
                    <path d="M2 7.2h12M5.4 1.8v3M10.6 1.8v3" />
                  </svg>
                </button>
              </div>

              {dateError && (
                <p
                  id="enquiry-date-error"
                  role="alert"
                  className="pl-4.5 font-sans text-[12px] leading-[1.6] text-clay"
                >
                  {dateError}
                </p>
              )}
            </div>

            <textarea
              name="message"
              rows={4}
              aria-label="Tell me about your vision"
              placeholder="Tell me about your vision"
              className={`${FIELD} resize-y rounded-[20px] px-4.5`}
            />

            {/* Honeypot. Positioned off-screen rather than `hidden`, which would
                keep bots away from it too; tabIndex and aria-hidden keep it out
                of the way of keyboards and screen readers. The function drops
                any submission that fills it in. */}
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute left-[-9999px] h-0 w-0 opacity-0"
            />

            <div className="flex flex-wrap gap-2.5">
              {/* type="reset" so the browser blanks the uncontrolled fields
                  itself; onReset on the form picks up what React owns. */}
              <button type="reset" className={RESET} disabled={sending}>
                Reset
              </button>
              <button type="submit" className={SUBMIT} disabled={sending}>
                {sending ? "Sending…" : "Send enquiry"}
              </button>
            </div>

            {status === "error" && (
              <p
                role="alert"
                className="border-l-2 border-l-rust pl-3 font-sans text-[13px] leading-[1.7] text-clay"
              >
                {error}
              </p>
            )}
          </form>
        )}
      </div>

      <footer className="border-t border-footer-border">
        <div className="mx-auto flex max-w-shell flex-wrap items-center justify-between gap-3 px-gutter py-6 font-sans text-[10px] tracking-[0.14em] text-footer-text uppercase">
          <span>© 2026 Naga Sushmitha</span>
          <span>Bridal · Editorial — Bangalore</span>
        </div>
      </footer>
    </section>
  );
}
