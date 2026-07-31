import { useEffect } from "react";
import s from "./Lightbox.module.css";

export default function Lightbox({ src, onClose }) {
  useEffect(() => {
    if (!src) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div className={s.overlay} onClick={onClose} role="presentation">
      <div
        role="img"
        aria-label="Bridal work"
        className={s.image}
        style={{ backgroundImage: `url("${src}")` }}
      />
    </div>
  );
}
