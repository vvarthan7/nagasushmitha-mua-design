import { useEffect } from "react";

const OVERLAY = [
  /* Layer 60, alongside the gallery viewer — above the nav (30) and the
     WhatsApp button (40). */
  "fixed inset-0 z-60 flex cursor-zoom-out items-center justify-center",
  "bg-ink/93 p-[clamp(16px,4vw,44px)]",
].join(" ");

const IMAGE = [
  "h-[min(82vh,900px)] w-[min(88vw,720px)] rounded-[14px]",
  "bg-contain bg-center bg-no-repeat",
  "drop-shadow-[0_30px_70px_rgba(0,0,0,0.5)]",
].join(" ");

interface LightboxProps {
  /** The photo to show, or null for closed — the overlay renders nothing until
   *  a src arrives, so callers keep it mounted and just swap this. */
  src: string | null;
  onClose: () => void;
}

export default function Lightbox({ src, onClose }: LightboxProps) {
  useEffect(() => {
    if (!src) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div className={OVERLAY} onClick={onClose} role="presentation">
      <div
        role="img"
        aria-label="Bridal work"
        className={IMAGE}
        style={{ backgroundImage: `url("${src}")` }}
      />
    </div>
  );
}
