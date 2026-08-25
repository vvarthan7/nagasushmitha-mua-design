import { useState, type ReactNode } from "react";
import serviceBridal from "../assets/bridal/NS_Bridal_10.webp";
import serviceEditorial from "../assets/editorial/NS_Editorial_5.webp";
import servicePersonal from "../assets/party/NS_Party_1.webp";
import { pill } from "../styles/ui";

interface Service {
  /** Short label for the tab. */
  name: string;
  title: string;
  body: ReactNode;
  pills: string[];
  image: string;
}

const SERVICES: Service[] = [
  {
    name: "Bridal",
    title: "Bridal makeup & hair",
    image: serviceBridal,
    pills: ["Trial included", "Premium products", "All occasions"],
    body: (
      <>
        Luxury bridal makeup that enhances, not hides, your natural beauty.
        Thoughtfully crafted for weddings, every bridal experience includes a
        personalised trial, wedding-day planning, and premium products that look
        flawless in both natural light and photography.
      </>
    ),
  },
  {
    name: "Editorial",
    title: "Editorial & portfolio",
    image: serviceEditorial,
    pills: ["On location", "Studio flash", "Continuity"],
    body: (
      <>
        Portfolio shoots, campaigns and film. Looks designed for flash, for
        continuity across a long shoot day, and for retouch-light delivery.
      </>
    ),
  },
  {
    name: "Personal",
    title: "Personal makeup course",
    image: servicePersonal,
    pills: ["One to one", "2 sessions", "Product list"],
    body: (
      <>
        A private session for your own face — what suits your features, what to
        own, what to skip.
      </>
    ),
  },
];

const PANEL = [
  "grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] items-center",
  "gap-[clamp(22px,4vw,40px)] rounded-[clamp(16px,2vw,24px)]",
  "bg-blush-soft p-[clamp(22px,3.5vw,38px)]",
].join(" ");

/* Not the shared pill primitive — these are inert labels, not controls: no
   border, no pointer, blush fill rather than a plum toggle. */
const TAG = [
  "rounded-full bg-blush px-4 py-2.25 font-sans text-[10px]",
  "tracking-[0.1em] text-plum uppercase",
].join(" ");

/* hover:text-plum is what pins the colour — without it the base-layer a:hover
   rule would recolour this to rust. */
const LINK = [
  "mt-1 w-fit border-b border-border pb-1 font-sans text-[10px]",
  "font-semibold tracking-[0.14em] text-plum uppercase hover:text-plum",
].join(" ");

const FRAME = [
  "aspect-4/5 w-full max-w-100 justify-self-center overflow-hidden",
  "rounded-[clamp(60px,12vw,120px)_clamp(60px,12vw,120px)_10px_10px]",
  "bg-border-soft",
].join(" ");

export default function Services() {
  const [active, setActive] = useState(0);
  const service = SERVICES[active];

  return (
    <section
      id="services"
      className="mx-auto flex max-w-shell scroll-mt-nav-offset flex-col gap-[clamp(18px,3vw,26px)] px-gutter py-[clamp(40px,6vw,72px)]"
    >
      <h2 className="font-serif text-[clamp(26px,4vw,38px)] font-normal text-ink">
        What we do
      </h2>

      <div className="flex flex-wrap gap-2" role="tablist">
        {SERVICES.map((item, i) => (
          <button
            key={item.name}
            type="button"
            role="tab"
            aria-selected={active === i}
            className={pill(active === i)}
            onClick={() => setActive(i)}
          >
            {item.name}
          </button>
        ))}
      </div>

      <div className={PANEL}>
        <div className="flex flex-col gap-3.5">
          <h3 className="font-serif text-[clamp(22px,3.2vw,30px)] font-normal text-ink">
            {service.title}
          </h3>
          <p className="max-w-[46ch] font-sans text-[14px] leading-[1.8] text-pretty text-text [&_em]:text-plum">
            {service.body}
          </p>
          <div className="mt-1 flex flex-wrap gap-2">
            {service.pills.map((tag) => (
              <span key={tag} className={TAG}>
                {tag}
              </span>
            ))}
          </div>
          <a href="#enquire" className={LINK}>
            Enquire about this →
          </a>
        </div>

        <div className={FRAME}>
          {/* Rendered as a background so it can scale inside the clipped frame
              above. */}
          <div
            role="img"
            aria-label={service.title}
            className="h-full w-full bg-cover bg-center transition-transform duration-1000 ease-brand"
            style={{ backgroundImage: `url("${service.image}")` }}
          />
        </div>
      </div>
    </section>
  );
}
