import { useEffect, useState } from "react";
import { WHATSAPP_URL } from "../data";

/* hover:text-white pins the colour — without it the base-layer a:hover rule
   would recolour the glyph (it inherits via currentColor) to rust. */
const FAB = [
  "fixed right-[clamp(14px,3vw,28px)] bottom-[clamp(14px,3vw,28px)] z-40",
  "grid size-[clamp(52px,12vw,58px)] place-items-center",
  "rounded-full bg-whatsapp text-white hover:text-white",
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
      aria-label="WhatsApp me"
      target="_blank"
      rel="noopener noreferrer"
    >
      {/* The glyph carries the whole affordance now the label is gone, so the
          name it used to spell out moves to the anchor's aria-label. */}
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.57-.085 1.757-.719 2.005-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.002-5.45 4.437-9.884 9.889-9.884a9.825 9.825 0 016.988 2.898 9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.886 9.884zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.463 3.488z" />
      </svg>
    </a>
  );
}
