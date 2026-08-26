/* Photos with a fixed role on the page, referenced by name below. */
import bridal01 from "./assets/gallery/bridal-01.jpg";
import bridal04 from "./assets/gallery/bridal-04.jpg";
/* The portfolio grid's photos are not imported here. They go through
   `photo()` below, which resolves a path to both the image and its blur
   placeholder at once — see the note there for why the two cannot be named
   separately. The banner's four frames are imported by HeroReel.tsx itself. */
import { blurs, type BlurKey } from "./data.blur";
import type {
  BookingStep,
  FaqItem,
  GalleryCategory,
  GalleryShot,
  Testimonial,
  Work,
  WorkCategory,
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

  /* `numeric` is what makes NS_Bridal_2 come before NS_Bridal_10. A plain
     localeCompare orders these by character, which puts every teens-numbered
     photo between 1 and 2 — and because the sets below are taken off the
     front of this list, that ordering decides which photos appear at all, not
     just the order they appear in. */
  return [...bestByPhoto.entries()]
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([, entry]) => entry.url);
}

/* Both letter cases are listed because glob matching is case-sensitive and
   phone cameras write .JPG. The pattern is repeated rather than hoisted into a
   constant because import.meta.glob is compiled away at build time and only
   accepts a literal.

   src/assets/banner is not swept here. The banner names its four frames one by
   one in HeroReel.tsx and imports them there, so nothing in this module needs
   them — see the note above FRAMES for why they were moved out. */
const bridalModules = import.meta.glob<ImageModule>(
  "./assets/bridal/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}",
  { eager: true },
);

const partyModules = import.meta.glob<ImageModule>(
  "./assets/party/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}",
  { eager: true },
);

const editorialModules = import.meta.glob<ImageModule>(
  "./assets/editorial/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}",
  { eager: true },
);

const bridalShots = pickShots(bridalModules);
const editorialShots = pickShots(editorialModules);

/* The photos `photo()` can resolve, by path. These are three of the four
   folders the placeholder generator covers — banner/ is the fourth and belongs
   to HeroReel.tsx now — so a placeholder key is not on its own proof that this
   map holds the photo; see the FOLDERS note in scripts/generate-blur.mjs.

   bridal/, party/ and editorial/ are one folder per portfolio filter, so a
   photo's folder is what decides which chip it appears under: moving a file
   between them is the whole of re-categorising it, once its entry below names
   the new path. */
const modulesByPath: Record<string, ImageModule> = {
  ...bridalModules,
  ...partyModules,
  ...editorialModules,
};

/** Resolves one photo to the two things a blur-up needs: the hashed URL Vite
 *  emits, and the placeholder held in front of it until it arrives. Used by
 *  the portfolio tiles.
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
function photo(key: BlurKey): { src: string; blur: string } {
  const module = modulesByPath[`./assets/${key}`];
  if (!module) {
    throw new Error(
      `No image at src/assets/${key}. Its placeholder exists, so the file was renamed or removed after the last \`npm run blur\`.`,
    );
  }
  return { src: module.default, blur: blurs[key] };
}

/* The WhatsApp number comes from the environment so it can be changed without
   a code edit or a rebuild of anyone's mental model of where contact details
   live. It carries the VITE_ prefix because it is read in the browser, and
   that prefix is exactly what makes Vite willing to inline it — meaning the
   number is baked into the shipped JS in plain sight. Fine here: it is already
   published as a click-to-chat link. It is also why RESEND_API_KEY must never
   be given a VITE_ name; see functions/api/enquiry.ts.

   Stripped to digits because wa.me wants international format with no +,
   spaces or dashes, so "+91 93807 58632" and "919380758632" both work. */
const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER ?? "").replace(
  /\D/g,
  "",
);

/* Thrown rather than defaulted, in the same spirit as photo() above: a silent
   fallback here would ship a dead WhatsApp link on a site whose visitors are
   asked to use it for anything urgent. */
if (!whatsappNumber) {
  throw new Error(
    "VITE_WHATSAPP_NUMBER is not set. Copy .env.example to .env.local for local work, or set it in the host's environment settings for a deploy.",
  );
}

export const WHATSAPP_URL = `https://wa.me/${whatsappNumber}`;
export const INSTAGRAM_URL =
  "https://www.instagram.com/nagasushmithamakeupartist/";
export const INSTAGRAM_HANDLE = "@nagasushmithamakeupartist";
export const EMAIL = "contact@nsmakeupartistry.com";

/* How many photos each strip filter carries, taken off the front of its
   folder by number: Bridal runs NS_Bridal_1 through _9, Editorial
   NS_Editorial_1 through _5.

   The folders hold more than that (21 and 14) and are meant to. The strip is a
   teaser, so these caps are what lets the rest of each folder stay available to
   photo() below without every new file turning up on the home page.

   To change what a filter shows, renumber the files rather than editing a list
   here: a set is always the first N by number, so NS_Bridal_12 joins the strip
   by becoming NS_Bridal_4, not by being named anywhere in this file. */
const STRIP_SHOTS: Record<GalleryCategory, number> = {
  Bridal: 9,
  Editorial: 5,
};

export const gallery: GalleryShot[] = [
  ...bridalShots
    .slice(0, STRIP_SHOTS.Bridal)
    .map((src): GalleryShot => ({ src, category: "Bridal" })),
  ...editorialShots
    .slice(0, STRIP_SHOTS.Editorial)
    .map((src): GalleryShot => ({ src, category: "Editorial" })),
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

export const beforeImage = bridal04;
export const afterImage = bridal01;

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
    a: "Three to six months for peak season November to February. Off-season dates often open up with a month of notice.",
  },
  {
    q: "What about my bridesmaids and family?",
    a: "Party makeup is charged per person and can be handled by me or my assistant, depending on how many faces and how tight the timeline is.",
  },
];

export const testimonials: Testimonial[] = [
  {
    testimonial:
      "She did the makeover for my wedding. It was really comfortable working with her. She has a very friendly nature, and I would highly recommend her for makeup, hairstyling, and costume designing. She has a great sense of the latest fashion. It was truly awesome, and I looked beautiful in all my wedding attires. I received compliments from all my relatives, friends, and family members.",
    name: "Deepika Suresh",
    meta: "Bride",
  },
  {
    testimonial:
      "*A wonderful MUA*, I had my makeup done by Sushmitha for the first time for my baby shower. The attention to detail she gave was very impressive, and I was extremely happy with how I looked at the end of the session. She is very professional and understanding of how we want to look, which is very important. More power to you, girl! Way to go!",
    name: "Hema katta",
    meta: "Baby Shower",
  },
  {
    testimonial:
      "You're an amazing artist. Truly, it's not just your hands, but your soul that creates pure magic. And obviously, it showed.",
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
      "Makeup was lit! 🔥 Literally, I received so many compliments! Thank you so much for such amazing makeup on my best day.",
    name: "Navya Vishwesh",
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
   its folder says. These tiles each carry a title and a line of context, so
   they are listed by hand — the cost of a photo here is one entry, not one
   file.

   The set is the three photo folders in full: bridal/ (21), party/ (8) and
   editorial/ (14), one folder per filter chip. Nothing is held back, so the
   count below is the count on disk, and a new photograph is one entry here
   plus a run of `npm run blur`.

   `meta` names the occasion and nothing else. The mock carried places and
   years, and those were invented — these files carry no date and no location,
   so nothing is claimed that the photograph cannot back up. It is also not
   drawn anywhere today (see the note on Work.meta), which is exactly why a
   wrong year would have sat there unseen until the day something started
   printing it.

   Three fields are set per photo rather than to a shared default, and all three
   have to be re-picked when a photo is swapped:

   - `position` is the tile crop. `object-cover` fills the tile and throws away
     whatever overflows, so this is what decides that the face survives. Which
     axis it acts on is decided by the source, not by taste: a tile is roughly
     0.9 wide-to-tall, so the portrait sources (most of these, at 0.67) are
     width-driven and only their Y does anything, while the 3:2 landscapes are
     height-driven and only their X does. The values below are set against
     where the face actually falls in that frame — the profiles, the
     full-length shots and the ones where she stands off-centre are why there
     is no sensible default here.
   - `height` / `mobileHeight` are the masonry tile heights, set from each
     photo's aspect ratio rather than to a rhythm: the 2:3 portraits take the
     tall tiles (300–320), the 3:4s the middle band (265–290), the squares
     235–240 and the 3:2 landscapes the short ones (200–225), because a
     landscape photo in a tall tile is nearly all crop. The variety this
     produces is what makes the columns stagger, so the masonry falls out of
     the photography rather than being imposed on it.

   One file serves both the tile and the open viewer — there are no resized
   copies. Several sources are large (the 6000×4000 SFX frames, NS_Bridal_10 at
   4480×6720), which the tiles' `loading="lazy"` covers for below-the-fold work
   but not for the first screenful. Generating thumbnails is the fix if this
   page ever needs to be fast on a phone connection. */
export const works: Work[] = [
  {
    id: 1,
    title: "Jasmine & Mauve",
    category: "Bridal",
    meta: "Muhurtham",
    ...photo("bridal/NS_Bridal_1.webp"),
    position: "50% 24%",
    height: 320,
    mobileHeight: 182,
  },
  {
    id: 2,
    title: "Reception Ivory",
    category: "Bridal",
    meta: "Reception",
    ...photo("bridal/NS_Bridal_2.webp"),
    position: "50% 25%",
    height: 280,
    mobileHeight: 160,
  },
  {
    id: 3,
    title: "The Earring",
    category: "Bridal",
    meta: "Reception",
    ...photo("bridal/NS_Bridal_3.webp"),
    position: "54% 18%",
    height: 285,
    mobileHeight: 162,
  },
  {
    id: 4,
    title: "Under the Garlands",
    category: "Bridal",
    meta: "Muhurtham",
    ...photo("bridal/NS_Bridal_4.webp"),
    position: "56% 26%",
    height: 310,
    mobileHeight: 177,
  },
  {
    id: 5,
    title: "By the Window",
    category: "Bridal",
    meta: "Engagement",
    ...photo("bridal/NS_Bridal_5.webp"),
    /* She stands right of centre with her hand out to the frame on the left,
       so the crop is nudged across to keep her face off the edge. */
    position: "54% 24%",
    height: 315,
    mobileHeight: 180,
  },
  {
    id: 6,
    title: "Final Touches",
    category: "Bridal",
    meta: "Getting ready",
    ...photo("bridal/NS_Bridal_6.webp"),
    /* Lit low, and she sits deep in the frame with two pairs of hands working
       on her, so this Y is further down than the portraits around it. */
    position: "50% 30%",
    height: 300,
    mobileHeight: 171,
  },
  {
    id: 7,
    title: "Silver in the Grove",
    category: "Bridal",
    meta: "Bridal portrait",
    ...photo("bridal/NS_Bridal_7.webp"),
    position: "50% 28%",
    height: 270,
    mobileHeight: 154,
  },
  {
    id: 8,
    title: "Marigold Silk",
    category: "Bridal",
    meta: "Muhurtham",
    ...photo("bridal/NS_Bridal_8.webp"),
    position: "52% 26%",
    height: 265,
    mobileHeight: 151,
  },
  {
    id: 9,
    title: "Temple Green",
    category: "Bridal",
    meta: "Muhurtham",
    ...photo("bridal/NS_Bridal_9.webp"),
    position: "52% 20%",
    height: 285,
    mobileHeight: 162,
  },
  {
    id: 10,
    title: "White Gown",
    category: "Bridal",
    meta: "Engagement",
    ...photo("bridal/NS_Bridal_10.webp"),
    position: "52% 21%",
    height: 320,
    mobileHeight: 182,
  },
  {
    id: 11,
    title: "Eyes Closed, Rose",
    category: "Bridal",
    meta: "Bridal portrait",
    ...photo("bridal/NS_Bridal_11.webp"),
    position: "50% 25%",
    height: 320,
    mobileHeight: 182,
  },
  {
    id: 12,
    title: "Rose & Gold Tikka",
    category: "Bridal",
    meta: "Bridal portrait",
    ...photo("bridal/NS_Bridal_12.webp"),
    position: "54% 28%",
    height: 315,
    mobileHeight: 180,
  },
  {
    id: 13,
    title: "Green Kanjeevaram",
    category: "Bridal",
    meta: "Muhurtham",
    ...photo("bridal/NS_Bridal_13.webp"),
    position: "50% 24%",
    height: 320,
    mobileHeight: 182,
  },
  {
    id: 14,
    title: "Blush Drape",
    category: "Bridal",
    meta: "Reception",
    ...photo("bridal/NS_Bridal_14.webp"),
    position: "50% 24%",
    height: 280,
    mobileHeight: 160,
  },
  {
    id: 15,
    title: "Yellow Silk, Seated",
    category: "Bridal",
    meta: "Muhurtham",
    ...photo("bridal/NS_Bridal_15.webp"),
    position: "52% 25%",
    height: 265,
    mobileHeight: 151,
  },
  {
    id: 16,
    title: "Maroon & Lime",
    category: "Bridal",
    meta: "Reception",
    ...photo("bridal/NS_Bridal_16.webp"),
    /* Landscape, so the X is the live axis here: the tile keeps about 60% of
       the width and she sits just left of centre. */
    position: "46% 34%",
    height: 205,
    mobileHeight: 117,
  },
  {
    id: 17,
    title: "The Archway",
    category: "Bridal",
    meta: "Muhurtham",
    ...photo("bridal/NS_Bridal_17.webp"),
    /* Full length in a lit archway and she is small in the frame, so her face
       falls near the middle of the photo rather than up at 25% like the rest
       of the folder. */
    position: "50% 42%",
    height: 315,
    mobileHeight: 180,
  },
  {
    id: 18,
    title: "Navy Sangeet",
    category: "Bridal",
    meta: "Sangeet",
    ...photo("bridal/NS_Bridal_18.webp"),
    position: "50% 30%",
    height: 225,
    mobileHeight: 128,
  },
  {
    id: 19,
    title: "In the Doorway",
    category: "Bridal",
    meta: "Muhurtham",
    ...photo("bridal/NS_Bridal_19.webp"),
    /* The widest source in the set (5:3), so the tile keeps barely half its
       width and the X is doing all the work — she stands right of centre in
       the doorway, with the near wall filling the left of the frame. */
    position: "62% 40%",
    height: 200,
    mobileHeight: 114,
  },
  {
    id: 20,
    title: "Terrace Green",
    category: "Bridal",
    meta: "Bridal portrait",
    ...photo("bridal/NS_Bridal_20.webp"),
    position: "50% 24%",
    height: 290,
    mobileHeight: 165,
  },
  {
    id: 21,
    title: "Powder Blue",
    category: "Bridal",
    meta: "Getting ready",
    ...photo("bridal/NS_Bridal_21.webp"),
    /* She stands left of centre in a dark room, so this X moves the opposite
       way to most of the folder. */
    position: "44% 26%",
    height: 315,
    mobileHeight: 180,
  },
  {
    id: 22,
    title: "Ochre Backdrop",
    category: "Party",
    meta: "Studio",
    ...photo("party/NS_Party_1.webp"),
    position: "48% 25%",
    height: 320,
    mobileHeight: 182,
  },
  {
    id: 23,
    title: "Black Sequin",
    category: "Party",
    meta: "Studio",
    ...photo("party/NS_Party_2.webp"),
    /* Full length, so the face sits high in the frame and the Y goes with it —
       much past 22% here and the crop takes the top of her head. */
    position: "50% 20%",
    height: 305,
    mobileHeight: 174,
  },
  {
    id: 24,
    title: "Red & Champagne",
    category: "Party",
    meta: "Cocktail",
    ...photo("party/NS_Party_3.webp"),
    /* The one square source in the set, so neither axis is doing much work —
       both values sit off centre only because she does. */
    position: "54% 32%",
    height: 240,
    mobileHeight: 137,
  },
  {
    id: 25,
    title: "Marigold Studio",
    category: "Party",
    meta: "Studio",
    ...photo("party/NS_Party_4.webp"),
    position: "50% 8%",
    height: 320,
    mobileHeight: 182,
  },
  {
    id: 26,
    title: "Magenta Pallu",
    category: "Party",
    meta: "Studio",
    ...photo("party/NS_Party_5.webp"),
    position: "46% 22%",
    height: 320,
    mobileHeight: 182,
  },
  {
    id: 27,
    title: "Teal, Low Key",
    category: "Party",
    meta: "Studio",
    ...photo("party/NS_Party_6.webp"),
    /* Landscape and she sits well right of centre against black, so this X is
       doing the framing on its own. */
    position: "62% 34%",
    height: 205,
    mobileHeight: 117,
  },
  {
    id: 28,
    title: "Botanical Drape",
    category: "Party",
    meta: "Studio",
    ...photo("party/NS_Party_7.webp"),
    position: "50% 10%",
    height: 320,
    mobileHeight: 182,
  },
  {
    id: 29,
    title: "Emerald Glow",
    category: "Party",
    meta: "Studio",
    ...photo("party/NS_Party_8.webp"),
    position: "56% 36%",
    height: 205,
    mobileHeight: 117,
  },
  {
    id: 30,
    title: "Red Ochre",
    category: "Editorial",
    meta: "Character",
    ...photo("editorial/NS_Editorial_1.webp"),
    position: "54% 32%",
    height: 310,
    mobileHeight: 177,
  },
  {
    id: 31,
    title: "Arrow & Henna",
    category: "Editorial",
    meta: "Concept shoot",
    ...photo("editorial/NS_Editorial_2.webp"),
    position: "56% 40%",
    height: 205,
    mobileHeight: 117,
  },
  {
    id: 32,
    title: "UV Bloom",
    category: "Editorial",
    meta: "Body paint",
    ...photo("editorial/NS_Editorial_3.webp"),
    position: "48% 45%",
    height: 240,
    mobileHeight: 137,
  },
  {
    id: 33,
    title: "Kundan in the Dark",
    category: "Editorial",
    meta: "Portfolio shoot",
    ...photo("editorial/NS_Editorial_4.webp"),
    position: "48% 26%",
    height: 310,
    mobileHeight: 177,
  },
  {
    id: 34,
    title: "Flower Crown",
    category: "Editorial",
    meta: "Portfolio shoot",
    ...photo("editorial/NS_Editorial_5.webp"),
    position: "58% 38%",
    height: 235,
    mobileHeight: 134,
  },
  {
    id: 35,
    title: "Tangerine Tulle",
    category: "Editorial",
    meta: "Portfolio shoot",
    ...photo("editorial/NS_Editorial_6.webp"),
    position: "48% 26%",
    height: 265,
    mobileHeight: 151,
  },
  {
    id: 36,
    title: "Hands in the Dark",
    category: "Editorial",
    meta: "Portfolio shoot",
    ...photo("editorial/NS_Editorial_7.webp"),
    position: "52% 38%",
    height: 205,
    mobileHeight: 117,
  },
  {
    id: 37,
    title: "Nilakantha",
    category: "Editorial",
    meta: "Character",
    ...photo("editorial/NS_Editorial_8.webp"),
    position: "48% 34%",
    height: 205,
    mobileHeight: 117,
  },
  {
    id: 38,
    title: "Blue Smoke",
    category: "Editorial",
    /* The same sitting as id 37, one frame further on. */
    meta: "Character",
    ...photo("editorial/NS_Editorial_9.webp"),
    position: "46% 36%",
    height: 205,
    mobileHeight: 117,
  },
  {
    id: 39,
    title: "Temple Gold",
    category: "Editorial",
    meta: "Portfolio shoot",
    ...photo("editorial/NS_Editorial_10.webp"),
    position: "50% 23%",
    height: 310,
    mobileHeight: 177,
  },
  {
    id: 40,
    title: "Bruise Work",
    category: "Editorial",
    /* Prosthetic work going on in this frame and finished in id 41 — the same
       session, and the pair reads as one if they land in the same column. */
    meta: "Character SFX",
    ...photo("editorial/NS_Editorial_11.webp"),
    position: "58% 40%",
    height: 205,
    mobileHeight: 117,
  },
  {
    id: 41,
    title: "The Reveal",
    category: "Editorial",
    /* The finished half of id 40 — see the note there. */
    meta: "Character SFX",
    ...photo("editorial/NS_Editorial_13.webp"),
    position: "50% 38%",
    height: 205,
    mobileHeight: 117,
  },
  {
    id: 42,
    title: "Gilded Profile",
    category: "Editorial",
    meta: "Portfolio shoot",
    ...photo("editorial/NS_Editorial_12.webp"),
    position: "54% 28%",
    height: 310,
    mobileHeight: 177,
  },
  {
    id: 43,
    title: "Greasepaint Grin",
    category: "Editorial",
    meta: "Character SFX",
    ...photo("editorial/NS_Editorial_14.webp"),
    position: "50% 30%",
    height: 310,
    mobileHeight: 177,
  },
];

/* The grid's filter row, in the order it is drawn. Bridal leads because it is
   the work most people arrive for, and it is also the filter the portfolio
   opens on — there is no unfiltered view, so the first entry here is what the
   page shows before anything is clicked. Reordering this list moves that
   default with it; Portfolio's initial state names "Bridal" directly rather
   than reading index 0, so the two have to be changed together.

   Derived rather than typed out so the row cannot drift from the data: a
   category with no photos left in `works` drops out of the row instead of
   sitting there as a chip that filters to an empty grid. Order follows
   WORK_CATEGORY_ORDER, not first appearance in `works`, so re-ordering the
   photos does not re-order the row.

   That derivation is what currently hides "Behind the Scenes" and "Before &
   After": no photo above carries either, so neither chip is drawn. They stay
   listed here — and in WorkCategory — because the photographs are coming, and
   this way turning them back on is one entry in `works`, not a change in
   three files. Do not "tidy" them away. */
const WORK_CATEGORY_ORDER: readonly WorkCategory[] = [
  "Bridal",
  "Party",
  "Editorial",
  "Behind the Scenes",
  "Before & After",
];

export const workFilters: readonly WorkCategory[] = WORK_CATEGORY_ORDER.filter(
  (c) => works.some((w) => w.category === c),
);
