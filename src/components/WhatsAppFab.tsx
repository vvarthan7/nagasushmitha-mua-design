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

interface WhatsAppFabProps {
  visible: boolean;
}

export default function WhatsAppFab({ visible }: WhatsAppFabProps) {
  return (
    <a
      href={WHATSAPP_URL}
      className={`${FAB} ${
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      target="_blank"
      rel="noopener noreferrer"
    >
      WhatsApp me
    </a>
  );
}
