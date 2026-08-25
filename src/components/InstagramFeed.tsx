import { instagramPosts, INSTAGRAM_URL, INSTAGRAM_HANDLE } from "../data";

export default function InstagramFeed() {
  return (
    /* Tinted, so the grid reads as its own band between the FAQ's white and the
       form's ink rather than running on from the FAQ. */
    <section className="bg-blush">
      <div className="mx-auto flex max-w-shell flex-col gap-[clamp(14px,2vw,20px)] px-gutter py-[clamp(36px,6vw,64px)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-[clamp(22px,3.4vw,32px)] font-normal text-ink">
            On Instagram
          </h2>
          <a
            href={INSTAGRAM_URL}
            className="font-sans text-[10px] tracking-[0.16em] text-rust uppercase"
          >
            {INSTAGRAM_HANDLE} →
          </a>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-[clamp(8px,1.2vw,12px)]">
          {instagramPosts.map((post) => (
            <a
              key={post.src}
              href={INSTAGRAM_URL}
              /* Placeholder tint is the lighter blush now that the band behind
                 it is blush — on the same value the tiles would be invisible
                 until their backgrounds paint. */
              className="group relative block aspect-square overflow-hidden rounded-xl bg-blush-soft"
              aria-label={`${INSTAGRAM_HANDLE} on Instagram`}
            >
              <span
                className="block h-full w-full bg-cover bg-center transition-transform duration-800 ease-brand group-hover:scale-110"
                style={{ backgroundImage: `url("${post.src}")` }}
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
