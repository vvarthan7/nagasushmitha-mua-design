import { heroImage, heroStats, WHATSAPP_URL } from "../data";

const ACTION = [
  "rounded-full font-sans text-[11px] font-semibold tracking-[0.14em]",
  "uppercase transition-all duration-300 ease-soft",
].join(" ");

const PRIMARY = [
  ACTION,
  "bg-plum px-7.5 py-4 text-white",
  "hover:-translate-y-0.5 hover:bg-rust hover:text-white",
].join(" ");

const SECONDARY = [
  ACTION,
  "border border-clay px-7.25 py-3.75 text-plum",
  "hover:border-rust hover:bg-blush hover:text-plum",
].join(" ");

const FRAME = [
  "aspect-3/4 w-full max-w-130 justify-self-center overflow-hidden bg-blush",
  "rounded-[clamp(90px,18vw,190px)_clamp(90px,18vw,190px)_12px_12px]",
].join(" ");

export default function Hero() {
  return (
    <section className="mx-auto grid max-w-shell grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-center gap-[clamp(28px,5vw,52px)] px-gutter pt-[clamp(24px,5vw,54px)] pb-[clamp(40px,7vw,76px)]">
      <div className="flex flex-col gap-[clamp(14px,2vw,19px)]">
        <p className="font-sans text-[clamp(9px,1.4vw,11px)] tracking-[0.26em] text-rust uppercase">
          Bridal makeup artist · Bangalore
        </p>
        {/* h2, not h1: the banner wordmark above is the page heading now. */}
        <h2 className="font-serif text-[clamp(38px,7vw,68px)] leading-[1.05] font-normal text-pretty text-ink [&_em]:text-plum">
          Your face, <em>your story</em> — told well.
        </h2>
        <p className="max-w-[42ch] font-sans text-[clamp(14px,1.7vw,16px)] leading-[1.75] text-pretty text-text">
          Muhurtham, reception, sangeet and the quiet morning before. Makeup,
          hair and saree draping, all from one calm pair of hands.
        </p>

        <div className="mt-1.5 flex flex-wrap gap-2.5">
          <a href="#enquire" className={PRIMARY}>
            Book your date
          </a>
          <a href={WHATSAPP_URL} className={SECONDARY}>
            WhatsApp
          </a>
        </div>

        <div className="mt-3.5 flex flex-wrap gap-[clamp(20px,4vw,34px)] border-t border-border-soft pt-5">
          {heroStats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-[3px]">
              <div className="font-serif text-[clamp(24px,3.4vw,30px)] text-plum">
                {stat.value}
              </div>
              <div className="font-sans text-[9px] tracking-[0.18em] text-meta uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={FRAME}>
        <img
          src={heroImage}
          alt="Bride wearing bridal makeup by Naga Sushmitha"
          className="block h-full w-full object-cover transition-transform duration-1400 ease-brand hover:scale-[1.07]"
        />
      </div>
    </section>
  );
}
