import { marqueeText } from "../data.js";
import s from "./Marquee.module.css";

export default function Marquee() {
  return (
    <div className={s.strip} aria-hidden="true">
      {/* Two identical runs so the -50% keyframe loops seamlessly. */}
      <div className={s.track}>
        <span>{marqueeText}</span>
        <span>{marqueeText}</span>
      </div>
    </div>
  );
}
