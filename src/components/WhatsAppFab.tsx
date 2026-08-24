import { useEffect, useState } from "react";
import { WHATSAPP_URL } from "../data";

/* hover:text-white pins the colour — without it the base-layer a:hover rule
   would recolour the label to rust. */
const FAB = [
  "fixed right-[clamp(14px,3vw,28px)] bottom-[clamp(14px,3vw,28px)] z-40",
  "rounded-full bg-whatsapp px-6 py-3.75 font-sans text-[11px] font-semibold",
  "tracking-[0.14em] text-white uppercase hover:text-white",
  "shadow-[0_14px_34px_rgba(44,26,28,0.3)]",
  "transition-all duration-450 ease-brand",
].join(" ");

/* Same 860px cutoff HeroReel and Enquire switch their layouts on. */
const MOBILE_QUERY = "(max-width: 860px)";

/* HeroReel drops its own WhatsApp CTA below 860px, so the FAB is the only
   affordance to it on a phone — it has to be there on load rather than
   waiting on the scroll-past-40px threshold `visible` otherwise gates it on. */
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = () => setIsMobile(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}

interface WhatsAppFabProps {
  visible: boolean;
}

export default function WhatsAppFab({ visible }: WhatsAppFabProps) {
  const isMobile = useIsMobile();
  const shown = visible || isMobile;

  return (
    <a
      href={WHATSAPP_URL}
      className={`${FAB} ${
        shown
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
      tabIndex={shown ? 0 : -1}
      aria-hidden={!shown}
      target="_blank"
      rel="noopener noreferrer"
    >
      WhatsApp me
    </a>
  );
}
