import { instagramPosts, INSTAGRAM_URL, INSTAGRAM_HANDLE } from "../data.js";
import s from "./InstagramFeed.module.css";

export default function InstagramFeed() {
  return (
    <section className={s.section}>
      <div className={s.head}>
        <h2 className={s.title}>On Instagram</h2>
        <a href={INSTAGRAM_URL} className={s.handle}>
          {INSTAGRAM_HANDLE} →
        </a>
      </div>

      <div className={s.grid}>
        {instagramPosts.map((post) => (
          <a
            key={post.src}
            href={INSTAGRAM_URL}
            className={s.post}
            aria-label={`${INSTAGRAM_HANDLE} on Instagram`}
          >
            <span
              className={s.media}
              style={{ backgroundImage: `url("${post.src}")` }}
            />
          </a>
        ))}
      </div>
    </section>
  );
}
