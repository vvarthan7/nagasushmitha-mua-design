export const PORTRAIT = "src/assets/nagasushmitha.webp";

interface Beat {
  label: string;
  body: string;
}

const BEATS: Beat[] = [
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

const SECTION = [
  "scroll-mt-nav-offset bg-blush",
  "px-[clamp(18px,4vw,48px)] py-[clamp(30px,4.5vw,68px)]",
  "upto-560:px-3.5 upto-560:py-6.5",
].join(" ");

/* The handoff dropped the card entirely at 560px, back when the section was
   white and the border only cost horizontal room. Against the tint the card is
   doing real work — it is also what keeps the beat hairlines legible, since
   border-soft all but disappears on blush — so it stays and just tightens up. */
const INNER = [
  "mx-auto grid max-w-shell grid-cols-[0.85fr_1.15fr] items-center",
  "gap-[clamp(32px,5vw,72px)] rounded-[20px] border border-border-soft",
  "bg-white p-[clamp(28px,4vw,68px)]",
  "upto-980:grid-cols-[1fr] upto-980:gap-[clamp(28px,5vw,44px)]",
  "upto-560:rounded-[14px] upto-560:px-4.5 upto-560:py-6",
].join(" ");

/* Offset outline behind the arch. It goes at 560px; there is no room for it. */
const FRAME = [
  "absolute -top-3.5 -left-3.5 right-5.5 bottom-7.5",
  "rounded-[200px_200px_12px_12px] border border-clay",
  "upto-980:right-4.5 upto-980:bottom-6",
  "upto-560:hidden",
].join(" ");

/* The source is a tall 2:3 full-body frame and the arch is 3:4, so it crops
   ~10% off the bottom. 16% holds her face and the rose across the upper 40%
   of the arch; retune it first if the photo is swapped. (The X value is inert
   at this aspect ratio — cover leaves no horizontal overflow — and is kept
   only so the crop still lands if the arch is reshaped.) */
const IMG = [
  "block h-full w-full animate-about-burns object-cover",
  "[object-position:55%_16%] [will-change:transform]",
  "motion-reduce:animate-none",
].join(" ");

const CTA = [
  "self-start rounded-full border border-clay px-7 py-3.5 font-sans",
  "text-[11px] font-semibold tracking-[0.14em] text-plum uppercase",
  "transition-all duration-300 ease-soft",
  "hover:border-plum hover:bg-plum hover:text-white",
  "focus-visible:border-plum focus-visible:bg-plum focus-visible:text-white",
  "upto-560:self-stretch upto-560:text-center",
].join(" ");

export default function AboutSection() {
  return (
    <section id="about" className={SECTION} aria-labelledby="about-heading">
      <div className={INNER}>
        <figure className="relative upto-980:w-full upto-980:max-w-105">
          <span className={FRAME} aria-hidden="true" />
          <div className="relative aspect-3/4 overflow-hidden rounded-[200px_200px_12px_12px] bg-blush">
            {/* Still lazy, and more so than before: the markup now reaches the
                browser during HTML parse rather than after React has mounted,
                so an eager portrait would be in the queue alongside the banner
                frame that decides LCP. The arch is aspect-ratioed, so nothing
                moves while it waits. */}
            <img
              className={IMG}
              src={PORTRAIT}
              alt="Naga Sushmitha holding a red rose"
              loading="lazy"
            />
          </div>
        </figure>

        <div className="flex flex-col gap-7.5">
          <div className="flex flex-col gap-3">
            <p className="font-sans text-[10px] tracking-[0.26em] text-rust uppercase">
              About Sushmitha
            </p>
            <h2
              className="font-serif text-[clamp(30px,3.4vw,46px)] leading-[1.12] font-normal text-pretty text-ink [&_em]:text-plum"
              id="about-heading"
            >
              Your beauty, <em>amplified</em>.
            </h2>
          </div>

          <dl className="flex flex-col">
            {BEATS.map((b) => (
              <div
                className="flex flex-col gap-1.5 border-t border-border-soft py-5 last:border-b"
                key={b.label}
              >
                <dt className="font-sans text-[11px] font-bold tracking-[0.14em] text-ink uppercase">
                  {b.label}
                </dt>
                <dd className="font-sans text-[14px] leading-[1.8] text-pretty text-text">
                  {b.body}
                </dd>
              </div>
            ))}
          </dl>

          <a className={CTA} href="#gallery">
            See her work
          </a>
        </div>
      </div>
    </section>
  );
}
