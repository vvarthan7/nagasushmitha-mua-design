import { academyImage } from "../data";

const ACTION = [
  "rounded-full font-sans text-[11px] font-semibold tracking-[0.14em]",
  "uppercase transition-all duration-300 ease-soft",
].join(" ");

const PRIMARY = [
  ACTION,
  "bg-white px-7 py-3.75 text-plum",
  "hover:-translate-y-0.5 hover:bg-blush hover:text-plum",
].join(" ");

const SECONDARY = [
  ACTION,
  "border border-academy-border px-6.75 py-3.5 text-white",
  "hover:bg-white/12 hover:text-white",
].join(" ");

export default function Academy() {
  return (
    <section id="courses" className="scroll-mt-nav-offset bg-plum">
      <div className="mx-auto grid max-w-shell grid-cols-[repeat(auto-fit,minmax(290px,1fr))] items-center gap-[clamp(24px,4vw,44px)] px-gutter py-[clamp(40px,6vw,70px)]">
        <div className="flex flex-col gap-3.75">
          <p className="font-sans text-[10px] tracking-[0.26em] text-dot uppercase">
            Academy
          </p>
          <h2 className="font-serif text-[clamp(26px,4vw,38px)] leading-[1.2] font-normal text-white">
            Learn makeup, hair &amp; <em>saree draping</em>
          </h2>
          <p className="max-w-[42ch] font-sans text-[14px] leading-[1.75] text-pretty text-academy-text">
            Personal self-makeup sessions and professional courses, taught in
            small groups in Bangalore. A new batch opens each month.
          </p>
          <div className="mt-1.5 flex flex-wrap gap-2.5">
            <a href="#enquire" className={PRIMARY}>
              See courses
            </a>
            <a href="#enquire" className={SECONDARY}>
              Syllabus
            </a>
          </div>
        </div>

        <div className="aspect-4/3 w-full max-w-130 justify-self-center overflow-hidden rounded-[clamp(14px,2vw,20px)]">
          <img
            src={academyImage}
            alt="Teaching a makeup masterclass"
            loading="lazy"
            className="block h-full w-full object-cover transition-transform duration-1200 ease-brand hover:scale-[1.06]"
          />
        </div>
      </div>
    </section>
  );
}
