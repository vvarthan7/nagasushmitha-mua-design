/* Photos with a fixed role on the page, referenced by name below. */
import bridal01 from "./assets/gallery/bridal-01.jpg";
import bridal02 from "./assets/gallery/bridal-02.jpg";
import bridal03 from "./assets/gallery/bridal-03.jpg";
import bridal04 from "./assets/gallery/bridal-04.jpg";
import bridal05 from "./assets/bridal/0K4A3042.webp";
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
   crops to whichever axis overflows. On desktop the banner is wider than any of
   these, so it crops to a horizontal band and Y decides whether the face is in
   it; on mobile the banner turns portrait and the two landscape frames overflow
   sideways instead, which is what the X values are for. The Ken Burns push then
   crops a further ~16% either way, so every face sits inside the middle 60%.
   Where one value cannot serve both — a subject far off-centre reads fine in the
   wide crop but falls off the edge of the narrow one — add an optional
   `mobilePosition`, which takes over below 860px. */
export const heroReelFrames = [
  {
    src: bridal05,
    position: "50% 16%",
    /* Her face sits ~66% across this frame, so once the banner goes portrait
       and the crop narrows to ~370 of its 1050 scaled px, 50% leaves her at the
       very right edge. Desktop is width-driven and unaffected. */
    mobilePosition: "76% 16%",
    alt: "Reception glam",
  },
  {
    src: editorial05,
    position: "62% 64%",
    alt: "Editorial look, graphic eye and floral hair",
  },
  {
    src: editorial04,
    position: "46% 48%",
    alt: "Editorial beauty portrait, smoky eye",
  },
  { src: bridal04, position: "50% 0%", alt: "Bridal look, muhurtham" },
];

export const heroStats = [
  { value: "400+", label: "Brides" },
  { value: "Since 2014", label: "Practice" },
  { value: "Bangalore", label: "Cities" },
];

export const marqueeText =
  "Bridal ◆ Muhurtham ◆ Reception ◆ Sangeet ◆ Editorial ◆ Saree draping ◆ Academy ◆ Portfolio ◆ Bridal ◆ Muhurtham ◆ Reception ◆ Sangeet ◆ Editorial ◆ Saree draping ◆ Academy ◆ Portfolio ◆";

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
    body: "Muhurtham, reception, sangeet and mehendi. A trial before the date, a written timetable on the morning, and a kit built for South Indian skin in Indian light.",
    pills: ["Trial included", "Travels pan-India", "Party rates"],
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
    body: "A private session for your own face — what suits your features, what to own, what to skip. You leave able to do it yourself.",
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

export const quotes = [
  {
    quote:
      "She matched my energy, calmed my nerves, and gave me exactly the face I had pictured for every event.",
    name: "Yamini H.",
    meta: "Bride, Bangalore",
  },
  {
    quote:
      "I never let anyone see me without makeup. The moment she walked in I felt at ease — then I saw the mirror and cried.",
    name: "Muskaan",
    meta: "Bride, Delhi",
  },
  {
    quote:
      "I came to the course with zero knowledge. I left choosing products for my own skin, and for other people.",
    name: "Puja H.",
    meta: "Academy, 5-day course",
  },
];
