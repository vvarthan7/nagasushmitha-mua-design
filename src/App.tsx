import { lazy, useEffect } from "react";
import { useScrolled } from "./hooks/useScrolled";
import Nav from "./components/Nav";
import HeroReel from "./components/HeroReel";
import Marquee from "./components/Marquee";
import AboutSection from "./components/AboutSection";
import WhatsAppFab from "./components/WhatsAppFab";
import Deferred from "./components/Deferred";
import type { GalleryCategory } from "./types";

/* Everything below the fold, loaded when the scroll gets near it rather than at
   load. Two things follow from `lazy` here, and the second is the one that
   matters:

   - the section's code leaves the main bundle and becomes a chunk of its own;
   - the section does not mount, so its photographs are never requested.

   The JavaScript is the small half of that — the whole page is around 25 kB of
   it. The pictures are the point. GalleryStrip alone puts fourteen photographs
   on the page and Enquire, BeforeAfter and Services carry more; requested at
   load, they compete for bandwidth with the four banner frames, which are the
   only images anyone can actually see yet. The banner is also the LCP element,
   and vite.config.ts already goes to some length to start frame 1 during HTML
   parse — that head start is exactly what a gallery loading behind it spends.

   Marquee and AboutSection stay eager: the first is text, and the second is the
   one section a visitor reaches without meaning to scroll. Nav and the FAB are
   eager because they are chrome, and WhatsAppFab has no images at all. */
const Services = () => import("./components/Services");
const BookingSteps = () => import("./components/BookingSteps");
const GalleryStrip = () => import("./components/GalleryStrip");
const BeforeAfter = () => import("./components/BeforeAfter");
const Testimonials = () => import("./components/Testimonials");
const Faq = () => import("./components/Faq");
const InstagramFeed = () => import("./components/InstagramFeed");
const Enquire = () => import("./components/Enquire");

const LazyServices = lazy(Services);
const LazyBookingSteps = lazy(BookingSteps);
const LazyGalleryStrip = lazy(GalleryStrip);
const LazyBeforeAfter = lazy(BeforeAfter);
const LazyTestimonials = lazy(Testimonials);
const LazyFaq = lazy(Faq);
const LazyInstagramFeed = lazy(InstagramFeed);
const LazyEnquire = lazy(Enquire);

/* In page order, so the browser has the code by the time a section is asked
   for and the only thing left to fetch at that point is its photographs. */
const BELOW_THE_FOLD = [
  Services,
  BookingSteps,
  GalleryStrip,
  BeforeAfter,
  Testimonials,
  Faq,
  InstagramFeed,
  Enquire,
];

/**
 * Fetches the chunks once the page has gone quiet.
 *
 * Deferring the mount is what keeps the photographs off the wire; deferring the
 * *code* until the same moment would only buy a stutter, since a section then
 * cannot render until a round trip completes. So the two are separated: the
 * code is collected during the idle time after the banner has settled, and the
 * mount — and with it every image request — still waits for the scroll.
 *
 * requestIdleCallback is what keeps this out of the way; where it is missing
 * (Safari before 17) a timeout is close enough, because the work being deferred
 * is a handful of small network fetches rather than anything that occupies the
 * main thread.
 */
function usePrefetchOnIdle(loaders: (() => Promise<unknown>)[]): void {
  useEffect(() => {
    /* A rejected prefetch is not an error anyone needs to hear about: the
       section will ask for the same chunk again when it mounts, and that
       attempt has a Suspense boundary behind it. */
    const run = () => {
      for (const load of loaders) void load().catch(() => {});
    };

    if (typeof requestIdleCallback === "function") {
      const handle = requestIdleCallback(run, { timeout: 3000 });
      return () => cancelIdleCallback(handle);
    }

    const timer = window.setTimeout(run, 2000);
    return () => window.clearTimeout(timer);
    /* Empty deps on purpose: the list is a module constant, and this is a
       once-per-load errand rather than something to keep in sync. */
  }, []);
}

interface AppProps {
  showAcademy?: boolean;
  showInstagram?: boolean;
  /** Which set the gallery opens on. */
  defaultFilter?: GalleryCategory;
}

export default function App({
  showAcademy = true,
  showInstagram = true,
  defaultFilter = "Bridal",
}: AppProps) {
  const scrolled = useScrolled(40);
  usePrefetchOnIdle(BELOW_THE_FOLD);

  /* The minHeight on each Deferred is a rough measure of the section it stands
     in for, in px. It holds the scrollbar's length and staggers the mounts; it
     is not a layout constraint, and the section takes whatever height it likes
     once it arrives. The className is only carried where a section paints a
     background of its own, so a placeholder caught on screen is the right
     colour rather than a white gap. */
  return (
    <>
      <Nav scrolled={scrolled} />
      <HeroReel />
      <Marquee />
      <AboutSection />

      <Deferred minHeight={760}>
        <LazyServices />
      </Deferred>

      <Deferred minHeight={520} className="bg-blush">
        <LazyBookingSteps />
      </Deferred>

      <Deferred minHeight={900}>
        <LazyGalleryStrip defaultCategory={defaultFilter} />
      </Deferred>

      <Deferred minHeight={620} className="bg-blush-soft">
        <LazyBeforeAfter />
      </Deferred>

      {/* {showAcademy && <Academy />} */}

      <Deferred minHeight={480}>
        <LazyTestimonials />
      </Deferred>

      <Deferred minHeight={560} className="bg-blush">
        <LazyFaq />
      </Deferred>

      {showInstagram && (
        <Deferred minHeight={420}>
          <LazyInstagramFeed />
        </Deferred>
      )}

      <Deferred minHeight={820} className="bg-ink">
        <LazyEnquire />
      </Deferred>

      <WhatsAppFab visible={scrolled} />
    </>
  );
}
