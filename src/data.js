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
import editorial04 from "./assets/editorial/img-3913.webp";
import editorial05 from "./assets/editorial/editorial-1.webp";
import nagasushmitha from "./assets/nagasushmitha/nagasushmitha.webp";

/* Gallery categories are folder-driven: drop a file into src/assets/<category>
   and it shows up, ordered by filename.
   Two rules keep the list clean:
   - HEIC is not in the extension list, because no browser can decode it.
   - When a photo exists in several formats (shot.webp next to shot.jpg, as
     happens mid-conversion) only the most efficient one is used, so the same
     photo never appears twice. */
const FORMATS_BY_PREFERENCE = ["avif", "webp", "jpg", "jpeg", "png"];

function pickShots(modules) {
  const bestByPhoto = new Map();

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
   phone cameras write .JPG. */
const bridalShots = pickShots(
  import.meta.glob(
    "./assets/bridal/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}",
    { eager: true },
  ),
);

const editorialShots = pickShots(
  import.meta.glob(
    "./assets/editorial/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}",
    { eager: true },
  ),
);

export const WHATSAPP_URL = "https://wa.me/910000000000";
export const INSTAGRAM_URL =
  "https://www.instagram.com/nagasushmithamakeupartist/";
export const INSTAGRAM_HANDLE = "@nagasushmithamakeupartist";
export const EMAIL = "hello@nagasushmitha.com";

export const gallery = [
  ...bridalShots.map((src) => ({ src, category: "Bridal" })),
  /* The one reception photo files under Bridal rather than carrying a filter of
     its own. It sits in assets/gallery/ rather than the globbed assets/bridal/,
     so unlike the rest of the group it has to be listed by hand — move the file
     across if you'd rather the glob picked it up. */
  { src: reception01, category: "Bridal" },
  ...editorialShots.map((src) => ({ src, category: "Editorial" })),
];

/* Every photo carries one of these, so there is no unfiltered view — the grid
   always has a category selected, Bridal on load. */
export const galleryFilters = ["Bridal", "Editorial"];

/* The strip is a teaser, so it stays at the eight tiles the layout was built
   for rather than growing with the gallery. */
export const instagramPosts = gallery.slice(0, 8);

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
export const heroReelFrames = [
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

export const heroStats = [
  { value: "400+", label: "Brides" },
  { value: "Since 2014", label: "Practice" },
  { value: "Bangalore", label: "Cities" },
];

export const marqueeText =
  "Bridal ◆ Muhurtham ◆ Reception ◆ Sangeet ◆ Editorial ◆ Saree draping ◆ Portfolio ◆ Bridal ◆ Muhurtham ◆ Reception ◆ Sangeet ◆ Editorial ◆ Saree draping ◆ Portfolio ◆";

export const bookingSteps = [
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

export const services = [
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

export const faqs = [
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

export const testimonials = [
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
