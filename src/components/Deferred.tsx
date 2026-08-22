import {
  Suspense,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

/**
 * Holds a section out of the tree until the page scrolls near it.
 *
 * The point is not the JavaScript — the whole home page is 25 kB of it. It is
 * the photography. An <img> or a background-image is requested the moment the
 * element mounts, so rendering the gallery strip, the before/after pair and the
 * services cards at load puts a couple of megabytes of picture into the same
 * connection as the banner, which is the one thing above the fold. Nothing
 * below the fold is worth a millisecond of the banner's, so those sections stay
 * unmounted and their photographs are never requested until the scroll gets
 * close.
 *
 * Each instance holds a plain <div> of `minHeight` in the meantime, which is
 * what keeps the scrollbar roughly honest and what makes the sections mount in
 * source order — a page of zero-height placeholders sits entirely inside the
 * first screenful, so every one of them would mount on the first flick of the
 * wheel and there would be nothing progressive about it. The heights are
 * estimates and are allowed to be wrong: `rootMargin` mounts a section before
 * it is on screen, so the swap from placeholder to real content always happens
 * below the viewport, where a few hundred px of difference moves nothing the
 * reader is looking at.
 *
 * `className` is for the sections that paint a background — a blush band that
 * arrives with its content is fine, a white gap that turns blush in front of
 * you is not, and on a slow chunk fetch the placeholder can be on screen.
 */

/* ── The escape hatch ──────────────────────────────────────────────────────
   Scrolling is the normal way in, but it is not the only way a section is
   asked for, and the others all fail the same way: the browser looks for
   `#enquire`, finds no such element because it has not mounted, and does
   nothing at all. So anything that wants a section it cannot see reveals the
   whole page first.

   A module-level flag rather than context, because the callers are document
   listeners rather than components — there is no tree for them to dispatch
   into, and every Deferred wants the same single bit. */
let revealed = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Mounts every remaining section now. Idempotent. */
export function revealAll(): void {
  if (revealed) return;
  revealed = true;
  for (const listener of listeners) listener();
}

/**
 * Waits for `id` to exist, then scrolls to it — because revealing a section is
 * not the same as having one: React still has to render it, and a lazy
 * section's chunk has to arrive over the network first. Hence a frame-by-frame
 * check rather than a single scroll, giving up after a second and a half on the
 * assumption that the id is simply not in this document.
 *
 * scrollIntoView rather than a computed offset: every anchored section carries
 * `scroll-mt-nav-offset`, so the fixed bar is already accounted for in CSS and
 * subtracting it again here would double it.
 */
function scrollToWhenReady(id: string): void {
  const deadline = performance.now() + 1500;

  const tick = () => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (performance.now() < deadline) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

/** Installs the escape hatches. Runs once, from the first Deferred to mount. */
function installEscapeHatches(): () => void {
  /* An in-page link. Captured rather than bubbled, and the default is taken
     over entirely: letting the browser try first would scroll to nothing and
     leave the address bar claiming otherwise. */
  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const anchor = (event.target as Element | null)?.closest?.("a");
    const href = anchor?.getAttribute("href");
    /* "#" and "#top" are the whole-document fragments — neither needs an
       element to exist, so the browser is left to handle them. */
    if (!href?.startsWith("#") || href === "#" || href === "#top") return;

    const id = decodeURIComponent(href.slice(1));
    if (document.getElementById(id)) return; // Already mounted; nothing to do.

    event.preventDefault();
    revealAll();
    history.pushState(null, "", href);
    scrollToWhenReady(id);
  };

  /* Landing on a fragment, or navigating to one: a bookmark, a shared link,
     the back button after one of the clicks above. */
  const onHashChange = () => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id || id === "top") return;
    revealAll();
    scrollToWhenReady(id);
  };

  /* Print wants the document, not the part of it that has been looked at. Find
     in page wants the same and has no event to hang off, so the shortcut is
     the closest thing there is — and a false positive costs one early mount. */
  const onPrint = () => revealAll();
  const onKeyDown = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f") {
      revealAll();
    }
  };

  document.addEventListener("click", onClick, true);
  window.addEventListener("hashchange", onHashChange);
  window.addEventListener("beforeprint", onPrint);
  window.addEventListener("keydown", onKeyDown);

  /* The page may have been opened on a fragment, in which case no event is
     coming and the browser has already tried and failed to scroll to it. */
  onHashChange();

  return () => {
    document.removeEventListener("click", onClick, true);
    window.removeEventListener("hashchange", onHashChange);
    window.removeEventListener("beforeprint", onPrint);
    window.removeEventListener("keydown", onKeyDown);
  };
}

/* The listeners belong to the page rather than to any one section, so the
   first instance to mount takes them and the rest skip the effect. */
let hatchOwner: symbol | null = null;

interface DeferredProps {
  children: ReactNode;
  /** Roughly what the section is worth in px, to hold the scrollbar's place. */
  minHeight: number;
  /** How far ahead of the viewport to mount. */
  rootMargin?: string;
  /** Carried by the placeholder, for sections that paint a background. */
  className?: string;
}

export default function Deferred({
  children,
  minHeight,
  rootMargin = "500px 0px",
  className,
}: DeferredProps) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useRef(Symbol("deferred"));

  /* A browser that cannot observe gets the section outright — it should see a
     whole page, just delivered less cleverly. */
  const [inRange, setInRange] = useState(
    () => typeof IntersectionObserver === "undefined",
  );

  const forced = useSyncExternalStore(
    subscribe,
    () => revealed,
    () => true,
  );

  useEffect(() => {
    if (hatchOwner && hatchOwner !== id.current) return;
    hatchOwner = id.current;
    const uninstall = installEscapeHatches();
    return () => {
      uninstall();
      hatchOwner = null;
    };
  }, []);

  useEffect(() => {
    if (inRange || forced) return;
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setInRange(true);
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inRange, forced, rootMargin]);

  const placeholder = (
    <div ref={ref} aria-hidden className={className} style={{ minHeight }} />
  );

  if (!inRange && !forced) return placeholder;

  /* One boundary per section, so a chunk still in flight holds up nothing but
     its own place. */
  return <Suspense fallback={placeholder}>{children}</Suspense>;
}
