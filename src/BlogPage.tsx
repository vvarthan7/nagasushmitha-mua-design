import { useEffect, useMemo } from "react";
import { useScrolled } from "./hooks/useScrolled";
import Nav from "./components/Nav";
import JournalPost from "./components/JournalPost";
import Enquire from "./components/Enquire";
import WhatsAppFab from "./components/WhatsAppFab";
import { postBySlug } from "./components/content";

/* The blog — a third document beside index.html and gallery.html rather than a
   route, for the same reason the gallery is one: the site has no router and
   builds to plain files. See blog.html and the `input` map in vite.config.ts
   for the other two thirds of that.

   Unlike the other two, this document is not one page. It is every post: the
   slug comes off the query string and picks an entry out of POSTS, so one
   design serves the whole journal and a new post is an entry in content.ts,
   not a new file here. There is no index — a bare ./blog.html has no slug on
   it and falls through to the newest post, which is what the bar's "Blog"
   entry points at.

   Nav is pinned solid rather than handed `scrolled`, as on the gallery: the
   bar's transparent palette exists for the home page's photographic banner to
   show through, and there is no banner here — the first thing under the bar is
   white page, where white type does not read. The FAB still takes the real
   scroll state on desktop; on mobile it shows itself on load regardless, per
   WhatsAppFab's own useIsMobile check. */
export default function BlogPage() {
  const scrolled = useScrolled(40);

  /* Read once on mount. The query string cannot change without a navigation,
     since every link between posts is a real page load. */
  const post = useMemo(
    () => postBySlug(new URLSearchParams(window.location.search).get("post")),
    [],
  );

  /* One document for every post means one <title> in the HTML, so blog.html
     names the journal and the post names itself here. Late enough for a
     browser tab and a bookmark; too late for a crawler that does not run
     scripts, which is the price of serving a whole journal off one static
     file. */
  useEffect(() => {
    document.title = `${post.title} — Naga Sushmitha`;
  }, [post]);

  return (
    <>
      <Nav scrolled homeHref="./" />
      {/* The bar is fixed, so it is out of flow and the hero would start
          underneath it without this padding. White because that is what the
          article is painted on and the clearance stands in front of it — the
          same reasoning as the gallery's blush band, with the other colour.

          Two values because the bar has two heights: the burger's min-h-11
          makes it 56px below 860px against 44px for the desktop row, and
          `upto-859` is the breakpoint the bar itself switches on. */}
      <main className="bg-white pt-11 upto-859:pt-14">
        <JournalPost post={post} />
      </main>
      <Enquire />
      <WhatsAppFab visible={scrolled} />
    </>
  );
}
