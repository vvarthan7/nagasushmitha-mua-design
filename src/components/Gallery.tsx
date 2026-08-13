import { useState } from "react";
import { gallery, galleryFilters } from "../data";
import type { GalleryCategory } from "../types";
import Lightbox from "./Lightbox";
import { pill } from "../styles/ui";

const ITEM = [
  "group relative block aspect-3/4 cursor-zoom-in overflow-hidden bg-blush",
  "rounded-[clamp(60px,9vw,100px)_clamp(60px,9vw,100px)_10px_10px]",
].join(" ");

const CAPTION = [
  "absolute right-0 bottom-0 left-0 px-2.5 pt-3.5 pb-2.75 text-center",
  "font-sans text-[9px] tracking-[0.18em] text-white uppercase",
  "bg-linear-to-t from-[rgba(44,26,28,0.72)] to-transparent",
].join(" ");

interface GalleryProps {
  defaultFilter?: GalleryCategory;
}

export default function Gallery({ defaultFilter = "Bridal" }: GalleryProps) {
  const [filter, setFilter] = useState<GalleryCategory>(defaultFilter);
  const [zoomed, setZoomed] = useState<string | null>(null);

  const shots = gallery.filter((g) => g.category === filter);

  return (
    <section
      id="gallery"
      className="mx-auto flex max-w-shell scroll-mt-nav-offset flex-col gap-[clamp(16px,2.5vw,22px)] px-gutter pt-18 pb-[clamp(40px,6vw,72px)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3.5">
        <h2 className="font-serif text-[clamp(26px,4vw,38px)] font-normal text-ink">
          Brides
        </h2>
        <div className="flex flex-wrap gap-2">
          {galleryFilters.map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={filter === name}
              className={pill(filter === name)}
              onClick={() => setFilter(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-[clamp(10px,1.6vw,16px)]">
        {shots.map((shot) => (
          <button
            key={shot.src}
            type="button"
            className={ITEM}
            onClick={() => setZoomed(shot.src)}
          >
            <span
              className="block h-full w-full bg-cover bg-center transition-transform duration-1000 ease-brand group-hover:scale-[1.08]"
              style={{ backgroundImage: `url("${shot.src}")` }}
            />
            <span className={CAPTION}>{shot.category}</span>
          </button>
        ))}
      </div>

      <Lightbox src={zoomed} onClose={() => setZoomed(null)} />
    </section>
  );
}
