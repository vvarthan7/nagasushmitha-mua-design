import { useState } from "react";
import { gallery, galleryFilters } from "../data.js";
import Lightbox from "./Lightbox.jsx";
import s from "./Gallery.module.css";

export default function Gallery({ defaultFilter = "All" }) {
  const [filter, setFilter] = useState(defaultFilter);
  const [zoomed, setZoomed] = useState(null);

  const shots =
    filter === "All" ? gallery : gallery.filter((g) => g.category === filter);

  return (
    <section id="gallery" className={s.section}>
      <div className={s.head}>
        <h2 className={s.title}>Real brides</h2>
        <div className={s.filters}>
          {galleryFilters.map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={filter === name}
              className={`${s.chip} ${filter === name ? s.chipOn : ""}`}
              onClick={() => setFilter(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div className={s.grid}>
        {shots.map((shot) => (
          <button
            key={shot.src}
            type="button"
            className={s.item}
            onClick={() => setZoomed(shot.src)}
          >
            <span
              className={s.media}
              style={{ backgroundImage: `url("${shot.src}")` }}
            />
            <span className={s.caption}>{shot.category}</span>
          </button>
        ))}
      </div>

      <Lightbox src={zoomed} onClose={() => setZoomed(null)} />
    </section>
  );
}
