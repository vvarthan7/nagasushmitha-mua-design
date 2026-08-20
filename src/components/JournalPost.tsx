import { useEffect, useMemo, useRef, useState } from "react";
import { INSTAGRAM_URL } from "../data";
import {
  LATEST_POST,
  nextPost,
  postHref,
  toc,
  type Block,
  type Post,
} from "./content";

/* The journal's one and only layout. Every post on the site is this component
   handed a different entry from POSTS in content.ts — see the note at the top
   of that file for why there is a single design rather than a page per post.

   It renders the article and nothing around it: no bar, no form, no footer.
   BlogPage supplies those from the same components every other page uses, so
   the journal inherits the site's chrome instead of keeping a second copy of
   it. This started life as a standalone mock with its own header and its own
   palette (`ink`/`mauve`/`cocoa`/`sand`/`line`, none of which are tokens in
   this project) — both are gone, and the classes below are the real ones from
   styles/tailwind.css. */

interface JournalPostProps {
  /** Defaults to the newest post, which is what a bare ./blog.html shows. */
  post?: Post;
  /** Where the rail's CTA points. Same-page by default: every page that shows
   *  this article also renders <Enquire>, so the form is already in the
   *  document and a cross-page link would be a needless load. */
  bookHref?: string;
}

/* One contents entry. Two palettes — the section in view takes plum, the rest
   sit in the muted body colour and come up to plum on hover. */
const TOC_LINK = [
  "flex items-baseline gap-3 border-t border-border-soft py-2.75",
  "text-[13px] leading-normal transition-colors duration-250 ease-soft",
].join(" ");

/* hover:text-plum pins the colour on all three: without it the base-layer
   a:hover rule would pull the two anchors to rust and leave the button — not
   an anchor, so not covered by that rule — behind at plum. */
const SHARE = [
  "grid size-9.5 place-items-center rounded-full border border-border",
  "text-[11px] font-semibold text-plum hover:bg-blush hover:text-plum",
  "transition-colors duration-250 ease-soft",
].join(" ");

export default function JournalPost({
  post = LATEST_POST,
  bookHref = "#enquire",
}: JournalPostProps) {
  const entries = useMemo(() => toc(post), [post]);
  const next = useMemo(() => nextPost(post), [post]);

  const [active, setActive] = useState(() => entries[0]?.id ?? "");
  const articleRef = useRef<HTMLDivElement>(null);

  /* Light up the contents entry for the section in view. Read off the DOM
     rather than off `entries` so it tracks the headings that actually
     rendered, and re-run on the post because the whole article is replaced
     when it changes. */
  useEffect(() => {
    const heads = Array.from(
      articleRef.current?.querySelectorAll<HTMLHeadingElement>("h2[id]") ?? [],
    );
    if (!heads.length) return;

    /* 200px down the viewport, not 0: the fixed bar takes the top ~56px, and
       a heading is "current" from the moment it has cleared that and settled
       into reading position — not only once it has left the screen. */
    const onScroll = () => {
      let current = heads[0].id;
      for (const h of heads) {
        if (h.getBoundingClientRect().top < 200) current = h.id;
      }
      setActive((prev) => (prev === current ? prev : current));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [post]);

  return (
    <div className="bg-white font-sans text-ink">
      {/* Hero: copy left, photograph right. */}
      <div className="grid border-b border-border-soft md:grid-cols-2">
        <div className="flex flex-col justify-center gap-3.5 px-gutter py-12 md:py-16">
          <p className="text-[10px] tracking-[0.26em] text-rust uppercase">
            {post.kicker}
          </p>
          <h1 className="font-serif text-[34px] leading-[1.06] font-normal tracking-[-0.01em] text-pretty md:text-[52px]">
            {post.title}
          </h1>
          <p className="max-w-[42ch] text-[15px] leading-[1.8] text-text text-pretty">
            {post.dek}
          </p>
          <p className="mt-1.5 text-[10px] tracking-[0.14em] text-meta uppercase">
            {post.date} · {post.read}
          </p>
        </div>
        {/* See Post.pos in content.ts: the same pair frames this band and the
            portrait thumbnail at the bottom, because the two crops overflow
            opposite axes. */}
        <img
          src={post.hero}
          alt={post.alt}
          style={{ objectPosition: post.pos }}
          className="h-[260px] w-full object-cover md:h-full md:min-h-[420px]"
        />
      </div>

      <div className="mx-auto grid max-w-shell gap-10 px-gutter pt-10 pb-20 md:grid-cols-[250px_1fr] md:gap-16 md:pt-14 md:pb-24">
        {/* Sticky rail. `top` clears the fixed bar — the same offset in-page
            anchors scroll to, so a heading and the rail entry naming it come
            to rest against the same line. */}
        <aside className="flex flex-col gap-7 md:sticky md:top-nav-offset md:self-start">
          <div className="flex flex-col gap-3">
            <p className="text-[10px] tracking-[0.26em] text-rust uppercase">
              In this post
            </p>
            <div className="flex flex-col">
              {entries.map((t, i) => (
                <a
                  key={t.id}
                  href={`#${t.id}`}
                  aria-current={active === t.id ? "true" : undefined}
                  className={`${TOC_LINK} ${
                    active === t.id
                      ? "text-plum"
                      : "text-text-muted hover:text-plum"
                  }`}
                >
                  <span className="font-serif text-sm text-clay italic">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{t.label}</span>
                </a>
              ))}
            </div>
          </div>

          <ShareRow title={post.title} />

          <a
            href={bookHref}
            className="w-fit border-b border-border pb-1 text-[10px] font-semibold tracking-[0.14em] text-plum uppercase"
          >
            Book a trial
          </a>
        </aside>

        {/* Article */}
        <article ref={articleRef} className="flex max-w-[66ch] flex-col gap-6">
          {post.body.map((b, i) => (
            <Prose key={i} block={b} />
          ))}

          {next && (
            <div className="mt-13 flex flex-col gap-4.5">
              <p className="text-[10px] tracking-[0.26em] text-rust uppercase">
                Keep reading
              </p>
              <a
                href={postHref(next)}
                className="flex flex-col gap-5 rounded-[20px] bg-blush p-5.5 shadow-tile transition-[transform,box-shadow] duration-350 ease-brand hover:-translate-y-1.5 hover:shadow-lift sm:flex-row sm:items-center sm:gap-6.5"
              >
                <img
                  src={next.hero}
                  alt=""
                  style={{ objectPosition: next.pos }}
                  className="h-[150px] w-[120px] shrink-0 rounded-t-[60px] rounded-b-[10px] object-cover"
                />
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-semibold tracking-[0.14em] text-rust uppercase">
                    {next.kicker} · {next.read}
                  </span>
                  <span className="max-w-[34ch] font-serif text-[22px] leading-[1.25] text-ink md:text-[26px]">
                    {next.title}
                  </span>
                  <span className="max-w-[52ch] text-sm leading-[1.8] text-text">
                    {next.dek}
                  </span>
                </div>
              </a>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}

/* One body block. Split out of the map so the switch is not nested three
   levels inside the layout; `k` is the whole of the decision. */
function Prose({ block }: { block: Block }) {
  switch (block.k) {
    case "lead":
      return (
        <p className="text-[17px] leading-[1.75] text-ink text-pretty md:text-[19px]">
          {block.t}
        </p>
      );
    case "h2":
      return (
        /* scroll-mt is the fixed bar's clearance, so a heading arrived at from
           the rail lands below it rather than underneath it. */
        <h2
          id={block.id}
          className="mt-8.5 -mb-1.5 scroll-mt-nav-offset font-serif text-[26px] leading-[1.15] font-normal text-pretty md:text-[32px]"
        >
          {block.t}
        </h2>
      );
    case "h3":
      return (
        <h3 className="mt-3 -mb-3 text-sm font-bold tracking-[0.02em] text-plum">
          {block.t}
        </h3>
      );
    case "num":
      return (
        <div className="flex gap-4.5 border-t border-border-soft py-5.5">
          <span className="font-serif text-[28px] leading-none text-clay italic">
            {block.n}
          </span>
          <div className="flex flex-col gap-2.25">
            <span className="font-serif text-[19px] leading-[1.35] md:text-[21px]">
              {block.t}
            </span>
            <p className="text-sm leading-[1.8] text-text text-pretty">
              {block.b}
            </p>
          </div>
        </div>
      );
    case "quote":
      return (
        <blockquote className="my-6.5 rounded-[20px] bg-blush px-7.5 py-6.5 font-serif text-[21px] leading-[1.55] text-ink italic text-pretty md:text-2xl">
          {block.t}
        </blockquote>
      );
    default:
      return (
        <p className="text-[15px] leading-[1.85] text-text text-pretty">
          {block.t}
        </p>
      );
  }
}

/* Share. The two outbound links are ordinary anchors so they can be
   middle-clicked; the third copies the current URL, which has no anchor form.

   Both the WhatsApp text and the copied URL are read at click time rather than
   at render, because window.location is not knowable while the module is being
   evaluated and the query string is the only thing that says which post this
   is. */
function ShareRow({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(id);
  }, [copied]);

  const share = () => {
    const url = window.location.href;
    /* Not available over plain http on a LAN address, which is exactly how
       this gets tested on a phone — fall back to the prompt rather than
       failing silently. */
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(
        () => setCopied(true),
        () => window.prompt("Copy this link", url),
      );
    } else {
      window.prompt("Copy this link", url);
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-[10px] tracking-[0.26em] text-rust uppercase">Share</p>
      <div className="flex gap-2">
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="Instagram"
          className={SHARE}
        >
          IG
        </a>
        <a
          /* wa.me with no number opens the contact picker, i.e. "send this to
             someone", rather than a chat with the studio. */
          href={`https://wa.me/?text=${encodeURIComponent(title)}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Share on WhatsApp"
          className={SHARE}
        >
          WA
        </a>
        <button
          type="button"
          onClick={share}
          aria-label="Copy link to this post"
          className={SHARE}
        >
          {copied ? "✓" : "↗"}
        </button>
      </div>
    </div>
  );
}
