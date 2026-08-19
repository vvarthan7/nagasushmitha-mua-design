import { useScrolled } from "./hooks/useScrolled";
import Nav from "./components/Nav";
import Portfolio from "./components/Portfolio";
import Enquire from "./components/Enquire";
import WhatsAppFab from "./components/WhatsAppFab";

/* The gallery page — a second document rather than a route, because the site
   has no router and does not need one for this. See gallery.html and the
   `input` map in vite.config.ts for the other two thirds of that.

   Nav is pinned solid rather than handed `scrolled`. On the home page the bar
   starts transparent because there is a photographic banner behind it to show
   through; here the first thing under the bar is the blush background, and
   white type on blush does not read. The FAB still takes the real scroll
   state — it is a scroll-triggered element on both pages. */
export default function GalleryPage() {
  const scrolled = useScrolled(40);

  return (
    <>
      <Nav scrolled homeHref="./" />
      {/* The bar is fixed, so it is out of flow and the grid would start
          underneath it without this padding.

          bg-blush is not decoration: the padding is what the page shows in the
          bar's place, and an untinted wrapper paints it in the body's white —
          a white band between the bar and the blush section, which is the one
          thing this clearance must not look like. The colour has to match what
          it is standing in front of.

          Two values because the bar has two heights: the burger's min-h-11
          makes it 56px below 860px, against 44px for the desktop row, and
          `upto-859` is the same breakpoint the bar itself switches on. This is
          deliberately tighter than --spacing-nav-offset (90px), which is
          scroll-margin for in-page anchors and carries slack on purpose so an
          anchored heading does not land flush against the bar. Here the
          section's own pt-8/md:pt-10 supplies that breathing room, and
          stacking both left ~130px of empty blush above the eyebrow. */}
      <main className="bg-blush pt-11 upto-859:pt-14">
        <Portfolio />
      </main>
      <Enquire />
      <WhatsAppFab visible={scrolled} />
    </>
  );
}
