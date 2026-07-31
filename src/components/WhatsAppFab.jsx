import { WHATSAPP_URL } from "../data.js";
import s from "./WhatsAppFab.module.css";

export default function WhatsAppFab({ visible }) {
  return (
    <a
      href={WHATSAPP_URL}
      className={`${s.fab} ${visible ? s.visible : ""}`}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
    >
      WhatsApp me
    </a>
  );
}
