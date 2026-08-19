/* Photos with a fixed role on the page, referenced by name below. */
import bridal01 from "./assets/gallery/bridal-01.jpg";
import bridal02 from "./assets/gallery/bridal-02.jpg";
import bridal03 from "./assets/gallery/bridal-03.jpg";
import bridal04 from "./assets/gallery/bridal-04.jpg";
import bridal05 from "./assets/bridal/0K4A3042.webp";
import bridal06 from "./assets/bridal/IMG_3894.webp";
import bridal07 from "./assets/bridal/IMG_3877.webp";
import bridal08 from "./assets/bridal/IMG_3892.webp";
import reception01 from "./assets/gallery/reception-01.jpg";
import editorial01 from "./assets/gallery/editorial-01.jpg";
import editorial02 from "./assets/gallery/editorial-02.jpg";
import editorial03 from "./assets/gallery/editorial-03.webp";
import nagasushmitha from "./assets/nagasushmitha/nagasushmitha.webp";
/* The portfolio grid's photos are not imported here. They go through `photo()`
   below, which resolves a path to both the image and its blur placeholder at
   once — see the note there for why the two cannot be named separately. */
import { blurs, type BlurKey } from "./data.blur";
import type {
  BookingStep,
  FaqItem,
  GalleryCategory,
  GalleryShot,
  HeroReelFrame,
  HeroStat,
  Service,
  Testimonial,
  Work,
  WorkCategory,
  WorkFilter,
} from "./types";

/* Gallery categories are folder-driven: drop a file into src/assets/<category>
   and it shows up, ordered by filename.
   Two rules keep the list clean:
   - HEIC is not in the extension list, because no browser can decode it.
   - When a photo exists in several formats (shot.webp next to shot.jpg, as
     happens mid-conversion) only the most efficient one is used, so the same
     photo never appears twice. */
const FORMATS_BY_PREFERENCE = ["avif", "webp", "jpg", "jpeg", "png"];

/** What an eager `import.meta.glob` yields per file: the same default-exported
 *  URL a static image import gives. */
interface ImageModule {
  readonly default: string;
}

/** A candidate file for one photo, kept only until a better format turns up.
 *  `rank` is an index into FORMATS_BY_PREFERENCE, so lower wins. */
interface RankedFile {
  rank: number;
  url: string;
}

function pickShots(modules: Record<string, ImageModule>): string[] {
  const bestByPhoto = new Map<string, RankedFile>();

  for (const [filePath, module] of Object.entries(modules)) {
    const file = filePath.slice(filePath.lastIndexOf("/") + 1);
    const dot = file.lastIndexOf(".");
    const photo = file.slice(0, dot).toLowerCase();
    const format = file.slice(dot + 1).toLowerCase();
    const rank = FORMATS_BY_PREFERENCE.indexOf(format);

    const existing = bestByPhoto.get(photo);
    if (!existing || rank < existing.rank) {
      bestByPhoto.set(photo, { rank, url: module.default });
    }
  }

  return [...bestByPhoto.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, entry]) => entry.url);
}

/* Both letter cases are listed because glob matching is case-sensitive and
   phone cameras write .JPG. The pattern is repeated rather than hoisted into a
   constant because import.meta.glob is compiled away at build time and only
   accepts a literal. */
const bridalModules = import.meta.glob<ImageModule>(
  "./assets/bridal/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}",
  { eager: true },
);

const editorialModules = import.meta.glob<ImageModule>(
  "./assets/editorial/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}",
  { eager: true },
);

const bridalShots = pickShots(bridalModules);
const editorialShots = pickShots(editorialModules);

/* The photos `photo()` can resolve, by path. These are the two folders the
   placeholder generator covers, and the two have to stay in step — see the
   FOLDERS note in scripts/generate-blur.mjs. */
const modulesByPath: Record<string, ImageModule> = {
  ...bridalModules,
  ...editorialModules,
};

/** Resolves one photo to the two things a portfolio tile needs: the hashed URL
 *  Vite emits, and its blur-up placeholder.
 *
 *  The point of going through a path rather than an import is that both come
 *  from the same key, so they cannot disagree. Pairing them by hand — a `src:`
 *  naming one import and a `blur:` naming a path — would let an entry point at
 *  one photo and preview another, and nothing would catch it: both halves are
 *  valid, they are just about different pictures.
 *
 *  BlurKey is a union of the paths data.blur.ts actually generated, so a
 *  renamed or deleted photo fails to compile here rather than at runtime. The
 *  throw is for the other direction — a photo that exists but has no
 *  placeholder yet, i.e. `npm run blur` has not been run since it was added. */
function photo(key: BlurKey): Pick<Work, "src" | "blur"> {
  const module = modulesByPath[`./assets/${key}`];
  if (!module) {
    throw new Error(
      `No image at src/assets/${key}. Its placeholder exists, so the file was renamed or removed after the last \`npm run blur\`.`,
    );
  }
  return { src: module.default, blur: blurs[key] };
}

export const WHATSAPP_URL = "https://wa.me/910000000000";
export const INSTAGRAM_URL =
  "https://www.instagram.com/nagasushmithamakeupartist/";
export const INSTAGRAM_HANDLE = "@nagasushmithamakeupartist";
export const EMAIL = "hello@nagasushmitha.com";

export const gallery: GalleryShot[] = [
  ...bridalShots.map((src): GalleryShot => ({ src, category: "Bridal" })),
  /* The one reception photo files under Bridal rather than carrying a filter of
     its own. It sits in assets/gallery/ rather than the globbed assets/bridal/,
     so unlike the rest of the group it has to be listed by hand — move the file
     across if you'd rather the glob picked it up. */
  { src: reception01, category: "Bridal" },
  ...editorialShots.map((src): GalleryShot => ({ src, category: "Editorial" })),
];

/* Every photo carries one of these, so there is no unfiltered view — the grid
   always has a category selected, Bridal on load. */
export const galleryFilters: readonly GalleryCategory[] = [
  "Bridal",
  "Editorial",
];

/* The strip is a teaser, so it stays at the eight tiles the layout was built
   for rather than growing with the gallery. */
export const instagramPosts: GalleryShot[] = gallery.slice(0, 8);

export const heroImage = bridal03;
export const aboutImage = nagasushmitha;
export const academyImage = editorial01;
export const beforeImage = bridal04;
export const afterImage = bridal01;

/* The banner cross-dissolves these in order over one 24s cycle. Exactly four,
   or the CSS keyframes desync — see HeroReel.md.

   `position` is the background-position, and it is per-photo because cover
   crops to whichever axis overflows. Only ever ONE axis does, so on any given
   breakpoint half of each pair is inert:

   - Desktop. The banner (100vw × 700px) is wider than all four sources, so
     cover matches the width and the height overflows. Y picks the horizontal
     band; X does nothing at all.
   - Below 860px. The banner is `min(88svh, 700px)` — taller than it is wide —
     so cover matches the height and the width overflows. Now X picks the
     column and Y does nothing.

   So the X in `position` only ever takes effect through `mobilePosition`'s
   fallback, and the Y in `mobilePosition` is decoration. Kept as full pairs
   because background-position needs both.

   Sources are 1333×2000 portrait except bridal05, which is 8088×5395
   landscape. The portrait ones lose most of their height on desktop — at
   1440px wide only ~32% of the photo is in the band, at 1920px only ~24% —
   which is why the Y values below are tuned per-photo against where the face
   actually falls, not set to a shared default. Ken Burns then pushes in a
   further ~9%, tightening around the centre.

   Re-tune Y here if `height` on <HeroReel> changes: a taller banner takes a
   deeper band, so a value that framed the chin at 620px can leave slack at the
   top at 700px. These are set for 700px. */
export const heroReelFrames: HeroReelFrame[] = [
  {
    src: bridal06,
    /* Head is cut above the brow at every desktop width — unavoidable, the
       band is shorter than she is. Y is set by the chin instead: at 1920px
       this lands it at ~86% of the banner, where 36% left it 1pt from being
       sliced. */
    position: "50% 39%",
    alt: "Bridal look, soft glam with a red rose garland",
  },
  {
    src: bridal05,
    /* The one landscape source, so the band is generous — 73% of the photo at
       1440px — and the top of her hair sits right at the upper edge. Left at
       16%: raising it starts cutting her hair, lowering it only adds ceiling. */
    position: "50% 16%",
    /* Her face sits ~66% across this frame, so once the banner goes portrait
       and the crop narrows to ~370 of its 1050 scaled px, 50% leaves her at the
       very right edge. Desktop is width-driven and unaffected. */
    mobilePosition: "76% 16%",
    alt: "Reception look, shimmer eye with sapphire and diamond jewellery",
  },
  {
    src: bridal07,
    /* The widest-framed of the four, so the extra 80px of banner buys real
       headroom here: 32% brings the top of her hair just inside the band at
       1440px, which 34% clipped. */
    position: "50% 32%",
    alt: "Muhurtham bridal look, warm eye with gold temple jewellery",
  },
  {
    src: bridal08,
    /* She sits far lower in this frame than in the other three — hair from 30%
       of the photo, necklace down to 60% — so this Y is the outlier by design.
       32% was spending the top third of the banner on empty black and slicing
       the necklace; 40% fits her whole head and the kundan. */
    position: "40% 40%",
    alt: "Bridal portrait in low light, defined eye with kundan choker and red embroidered lehenga",
  },
];

export const heroStats: HeroStat[] = [
  { value: "400+", label: "Brides" },
  { value: "Since 2014", label: "Practice" },
  { value: "Bangalore", label: "Cities" },
];

export const marqueeText =
  "Bridal ◆ Muhurtham ◆ Reception ◆ Sangeet ◆ Editorial ◆ Saree draping ◆ Portfolio ◆ Bridal ◆ Muhurtham ◆ Reception ◆ Sangeet ◆ Editorial ◆ Saree draping ◆ Portfolio ◆";

export const bookingSteps: BookingStep[] = [
  {
    n: "01",
    title: "Get in touch",
    body: "Send your dates, venue and bridal party size. I reply within 24 hours.",
  },
  {
    n: "02",
    title: "Trial & booking",
    body: "We lock the date with a deposit and plan every look together.",
  },
  {
    n: "03",
    title: "The big day",
    body: "I arrive early with a written timetable. You just relax.",
  },
];

export const services: Service[] = [
  {
    name: "Bridal",
    title: "Bridal makeup & hair",
    body: "Luxury bridal makeup that enhances, not hides, your natural beauty. Thoughtfully crafted for weddings, every bridal experience includes a personalised trial, wedding-day planning, and premium products that look flawless in both natural light and photography.",
    pills: ["Trial included", "Premium products", "All occasions"],
    image: editorial02,
  },
  {
    name: "Editorial",
    title: "Editorial & portfolio",
    body: "Portfolio shoots, campaigns and film. Looks designed for flash, for continuity across a long shoot day, and for retouch-light delivery.",
    pills: ["On location", "Studio flash", "Continuity"],
    image: editorial03,
  },
  {
    name: "Personal",
    title: "Personal makeup course",
    body: "A private session for your own face — what suits your features, what to own, what to skip.",
    pills: ["One to one", "2 sessions", "Product list"],
    image: bridal03,
  },
];

export const faqs: FaqItem[] = [
  {
    q: "Do you travel outside Bangalore?",
    a: "Yes — pan-India and overseas. Travel and stay are quoted separately, and I usually arrive a day early for destination weddings.",
  },
  {
    q: "Is a trial included?",
    a: "A trial is included with every bridal booking. We use it to settle the base, the eye and the drape so nothing is a surprise on the day.",
  },
  {
    q: "How far ahead should I book?",
    a: "Three to six months for peak season (November to February). Off-season dates often open up with a month of notice.",
  },
  {
    q: "What about my bridesmaids and family?",
    a: "Party makeup is charged per person and can be handled by me or my assistant, depending on how many faces and how tight the timeline is.",
  },
];

export const testimonials: Testimonial[] = [
  {
    testimonial:
      "She did makeover for my wedding. It was really comfortable working with her. Very Friendly nature. I would recommend her for the makeup, hairstyle and costume design. She has good sense of latest fashion stylea.It was really awsome and i was looking beutifull in all my wedding attires. I received compliments from all of my relatives, friends, family members. ",
    name: "Deepika Suresh",
    meta: "Bride",
  },
  {
    testimonial:
      "*A wonderful MUA* I had got make up done by sushmitha for the first time for my baby shower. The attention to small detailing that she gave was very impressive and I was super happy about how I looked at the end of the session. Very professional and understanding about how we want to look, which is very important. More power to you girl, way to go!",
    name: "Hema katta",
    meta: "Baby Shower",
  },
  {
    testimonial:
      "You're an amazing artist. Truly not just the hands ... but your soul... pure magic... n obviously it showed ",
    name: "Dr.Ranjana",
    meta: "Bride",
  },
  {
    testimonial:
      "NagaSushmitha , thank you so much for all the efforts and patience you put in the process. Couldn't have asked for better look for her + like I said she looked like a queen.",
    name: "Shreya Pandit",
    meta: "Bride's Sister",
  },
  {
    testimonial:
      "Today makeup was lit 🔥Like literally soooo manyyyyyyy manyyyy manyyyy compliments Thanks a Lott for such an amazing makeup for my best day",
    name: "Navya Vishwesh,",
    meta: "Bride",
  },
  {
    testimonial:
      "Sushmitha is excellent make up artist.. totally recommendable!! her humbleness is like cherry on the cake..Anytime I will need to get my makeup done in the future, I'm without a doubt going to her!",
    name: "Sri Raksha",
    meta: "Bride",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   Portfolio grid — the gallery page's set, rendered by Portfolio.

   Separate from `gallery` above, and deliberately so. That one is folder-driven
   (drop a file into src/assets/<category> and it appears) which is what makes
   it cheap to keep current, but it also means a photo can only ever say what
   its folder says. These tiles each carry a title, a place and a year, so they
   are listed by hand — the cost of a photo here is one entry, not one file.

   Three fields are set per photo rather than to a shared default, and all three
   have to be re-picked when a photo is swapped:

   - `position` is the tile crop. `object-cover` fills the tile and throws away
     whatever overflows, so this is what decides that the face survives. Set
     against where the face falls in that particular frame — the profile shots
     and the two where the bride sits off-centre are why there is no sensible
     default here.
   - `height` / `mobileHeight` are the masonry tile heights, set from each
     photo's aspect ratio rather than to a rhythm. The five landscape sources
     take the short tiles (200–210) because a landscape photo in a tall tile is
     nearly all crop; the portrait ones take 240–330. The variety this produces
     is what makes the columns stagger, so the masonry falls out of the
     photography rather than being imposed on it.

   One file serves both the tile and the open viewer — there are no resized
   copies. Several sources are large (0K4A3042 is 8088×5395, the two SFX frames
   are 6000×4000), which the tiles' `loading="lazy"` covers for below-the-fold
   work but not for the first screenful. Generating thumbnails is the fix if
   this page ever needs to be fast on a phone connection. */
export const works: Work[] = [
  {
    id: 1,
    title: "Muhurtham, Green Silk",
    category: "Bridal",
    meta: "Hyderabad · 2025",
    ...photo("bridal/IMG_3877.webp"),
    position: "50% 26%",
    height: 320,
    mobileHeight: 180,
  },
  {
    id: 2,
    title: "Under the Veil",
    category: "Bridal",
    meta: "Hyderabad · 2025",
    ...photo("bridal/IMG_3880.webp"),
    /* A profile, and she sits left of centre — 50% here puts the crop through
       her face at the two- and three-column widths. */
    position: "38% 26%",
    height: 300,
    mobileHeight: 170,
  },
  {
    id: 3,
    title: "In the Chair",
    category: "Before & After",
    /* This and id 9 are the same session: bruise work going on in this frame,
       finished in that one, which is what earns them the Before & After
       filter. The meta the mock carried here read "Bridal trial · 2024",
       which these two photographs are not — no year is claimed because the
       files carry no date. */
    meta: "Character SFX · Studio",
    ...photo("editorial/img-3824.webp"),
    position: "48% 45%",
    height: 200,
    mobileHeight: 118,
  },
  {
    id: 4,
    title: "Bloom Study",
    category: "Beauty",
    meta: "Studio · 2019",
    ...photo("editorial/editorial-1.webp"),
    position: "62% 40%",
    height: 240,
    mobileHeight: 140,
  },
  {
    id: 5,
    title: "Getting Ready",
    category: "Behind the Scenes",
    meta: "Reception · 2019",
    ...photo("bridal/IMG-20191222-WA0006.webp"),
    position: "60% 20%",
    height: 300,
    mobileHeight: 170,
  },
  {
    id: 6,
    title: "Red & Shadow",
    category: "Bridal",
    meta: "Reception · 2025",
    ...photo("bridal/IMG_3892.webp"),
    position: "56% 34%",
    height: 330,
    mobileHeight: 185,
  },
  {
    id: 7,
    title: "Neon Feathers",
    category: "Editorial",
    meta: "Body paint · 2019",
    ...photo("editorial/image-2.webp"),
    position: "40% 40%",
    height: 260,
    mobileHeight: 150,
  },
  {
    id: 8,
    title: "The Garland",
    category: "Bridal",
    meta: "Muhurtham · 2025",
    ...photo("bridal/IMG_3894.webp"),
    position: "50% 28%",
    height: 290,
    mobileHeight: 165,
  },
  {
    id: 9,
    title: "The Reveal",
    category: "Before & After",
    /* The finished half of id 3 — see the note there. */
    meta: "Character SFX · Studio",
    ...photo("editorial/img-3913.webp"),
    position: "48% 42%",
    height: 210,
    mobileHeight: 122,
  },
  {
    id: 10,
    title: "Kanjeevaram Gold",
    category: "Bridal",
    meta: "Temple · 2018",
    ...photo("bridal/IMG-20181218-WA0028.webp"),
    /* Full-length and framed in an archway, so she sits low: her face is at
       ~57% of the photo where every other portrait here puts it around 30%. */
    position: "48% 50%",
    height: 320,
    mobileHeight: 180,
  },
  {
    id: 11,
    title: "Gilded Arrow",
    category: "Editorial",
    meta: "Studio · 2019",
    ...photo("editorial/image-1.webp"),
    position: "46% 45%",
    height: 210,
    mobileHeight: 122,
  },
  {
    id: 12,
    title: "The Final Clasp",
    category: "Behind the Scenes",
    meta: "Reception · 2019",
    ...photo("bridal/IMG-20191222-WA0014.webp"),
    position: "46% 34%",
    height: 310,
    mobileHeight: 175,
  },
  {
    id: 13,
    title: "Pellikuthuru Morning",
    category: "Bridal",
    meta: "Hyderabad · 2024",
    ...photo("bridal/0K4A3951.webp"),
    position: "52% 30%",
    height: 310,
    mobileHeight: 175,
  },
  {
    id: 14,
    title: "Kundan Portrait",
    category: "Beauty",
    meta: "Studio · 2019",
    ...photo("bridal/image.webp"),
    position: "48% 34%",
    height: 250,
    mobileHeight: 145,
  },
  {
    id: 15,
    title: "Reception, Ivory",
    category: "Bridal",
    meta: "Jubilee Hills · 2024",
    ...photo("bridal/0K4A3042.webp"),
    /* The widest source in the set by a distance (8088×5395) and her face sits
       two thirds across it, so this is the one tile where the X does the work
       and 50% would leave her at the edge. */
    position: "68% 38%",
    height: 200,
    mobileHeight: 118,
  },
  {
    id: 16,
    title: "The Earring",
    category: "Behind the Scenes",
    meta: "Reception · 2019",
    ...photo("bridal/IMG-20191222-WA0019.webp"),
    position: "72% 32%",
    height: 205,
    mobileHeight: 120,
  },
  {
    id: 17,
    title: "Velvet Maroon",
    category: "Bridal",
    meta: "Reception · 2024",
    ...photo("bridal/IMG_8453.webp"),
    position: "46% 32%",
    height: 300,
    mobileHeight: 170,
  },
  {
    id: 18,
    title: "Yellow & Rose",
    category: "Bridal",
    meta: "Sangeet · 2019",
    ...photo("bridal/bridal-1.webp"),
    position: "56% 24%",
    height: 250,
    mobileHeight: 145,
  },
];

/* The grid's filter row, in the order it is drawn. "All" leads because the
   portfolio opens unfiltered — the one behavioural difference from
   `galleryFilters`, where a category is always selected.

   Derived rather than typed out so the row cannot drift from the data: a
   category with no photos left in `works` drops out of the row instead of
   sitting there as a chip that filters to an empty grid. Order follows
   WORK_CATEGORY_ORDER, not first appearance in `works`, so re-ordering the
   photos does not re-order the row. */
const WORK_CATEGORY_ORDER: readonly WorkCategory[] = [
  "Bridal",
  "Editorial",
  "Beauty",
  "Before & After",
  "Behind the Scenes",
];

export const workFilters: readonly WorkFilter[] = [
  "All",
  ...WORK_CATEGORY_ORDER.filter((c) => works.some((w) => w.category === c)),
];
