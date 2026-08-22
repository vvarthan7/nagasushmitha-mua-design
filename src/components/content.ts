/* Every journal post on the site.
   ═══════════════════════════════════════════════════════════════════════════

   One design, many posts. <JournalPost> is the only layout, blog.html is the
   only document, and everything that differs between two posts is an entry in
   POSTS below. Publishing means adding one object to that array — no new
   component, no new .html, no change to vite.config.ts.

   POSTS is ordered newest first, and that order is load-bearing twice over:
   blog.html with no query lands on POSTS[0], and the "keep reading" tile on
   any post points at the one after it. So a new post goes at the TOP of the
   array, and doing that is the whole act of publishing it.

   Heroes are imported rather than written as "/journal/trial.jpg" so Vite
   hashes and fingerprints them like every other photo on the site; a path
   under public/ would ship unhashed and uncached. */
import bridalTrialHero from "../assets/bridal/NS_Bridal_1.webp";
import kitEssentialsHero from "../assets/editorial/NS_Editorial_11.webp";

export type BlockKind = "lead" | "p" | "h2" | "h3" | "num" | "quote";

export interface Block {
  k: BlockKind;
  /** Anchor id. Set it on an h2 and that h2 joins the contents rail; leave it
   *  off and the section still renders but is not listed. Nothing else reads
   *  it, so it is only ever on h2 blocks. */
  id?: string;
  /** Heading, paragraph, question or quote text. */
  t: string;
  /** Rail label for an h2, for when the heading itself is too long to sit in
   *  a 250px column. Falls back to `t`. */
  nav?: string;
  /** Body copy for numbered items. */
  b?: string;
  /** Display numeral for numbered items. */
  n?: string;
}

export interface TocEntry {
  id: string;
  label: string;
}

export interface Post {
  /** URL key — see postHref below. Lower-case, hyphenated, and permanent once
   *  published, because it is what a shared link carries. */
  slug: string;
  kicker: string;
  title: string;
  dek: string;
  date: string;
  read: string;
  hero: string;
  /** Described, not decorative: the hero is the post's only photograph. */
  alt: string;
  /** object-position for the hero, and it serves both crops the layout makes
   *  of it — the landscape band at the top of the post, and the portrait
   *  thumbnail in the "keep reading" tile. That works because cover only ever
   *  crops the axis that overflows, and the two crops overflow opposite axes:
   *  the wide band is width-matched so only Y is live, the portrait tile is
   *  height-matched so only X is. One pair, both jobs. */
  pos: string;
  body: Block[];
}

/* ═══════════════════════════════════════════════════════════════════════════
   The bridal trial
   ═══════════════════════════════════════════════════════════════════════════ */

/* Pulled out of the body array because five long pairs written inline would
   bury the shape of the post. Spread back in as `num` blocks below. */
const TRIAL_QUESTIONS: [string, string][] = [
  [
    "Where are you going to place my highlight?",
    "This is a sneaky test. A novice will say, on the cheekbones. An expert will pull out a mirror and show you exactly where the light hits your face when you look straight ahead, and tailor the placement to your bone structure rather than using a generic C-curve on everyone.",
  ],
  [
    "What happens if my skin breaks out the morning of the wedding?",
    "Listen to the tone. “We will cover it” is fine. But “I will bring a calming clay mask for a five-minute spot treatment first, and I have a non-comedogenic concealer for blemishes” tells you this artist has a game plan for chaos.",
  ],
  [
    "Are you going to mix mediums, or just use one brand?",
    "This separates the pros from the salespeople. A real artist will say: a silicone-based primer with a water-based foundation, and a drop of facial oil mixed into the concealer so it does not crease. You want someone who mixes for your skin, not someone pushing a single label.",
  ],
  [
    "If I hate the lip colour once we are done, how long does it take to pivot?",
    "A confident artist will tell you the lip is the final boss — we try two or three shades on the back of your hand first, and pivoting takes two minutes: blot off the old one and re-line. You want to know they will not get defensive if you change your mind.",
  ],
  [
    "Is there an emergency fee to add a second look between the ceremony and the reception?",
    "Do not ask whether they can do it. Ask what it costs. Artists often charge a glam touch-up fee to swap a natural lip for a bold red in that thirty-minute gap. Knowing the number now prevents an awkward invoice later.",
  ],
];

const bridalTrial: Post = {
  slug: "bridal-trial",
  kicker: "Bridal",
  title: "The Bridal Trial",
  dek: "Do not book your wedding makeup artist without one. Here is what the session actually looks like — and the five questions that separate a pro from a salesperson.",
  date: "August 2026",
  read: "8 min read",
  hero: bridalTrialHero,
  alt: "A bride fastening an earring, in soft glam with a blush saree and a diamond choker",
  pos: "54% 26%",
  body: [
    { k: "lead", t: "If there is one piece of advice I could scream from the rooftops to every engaged person, it is this: do not book your wedding makeup artist without a trial." },
    { k: "p", t: "Think of the trial run as the dress rehearsal for your face. It is not only a test of the artist's skill; it is a test of chemistry, timing and your own expectations. A successful trial takes the anxiety out of your wedding morning and replaces it with pure excitement." },
    { k: "p", t: "Here is exactly what you need to know to walk into that appointment feeling confident, prepared and ready to collaborate." },

    { k: "h2", id: "expect", nav: "What to expect in the session", t: "What to actually expect during the session" },
    { k: "h3", t: "It is a conversation, not a command center." },
    { k: "p", t: "I usually spend the first ten to fifteen minutes just talking. We discuss your venue, your dress silhouette, and how you imagine yourself on the day. If you walk in and your artist starts applying products immediately without asking about your lifestyle, that is a red flag." },
    { k: "h3", t: "The blank canvas phase." },
    { k: "p", t: "Unless we have specifically discussed otherwise, I will start with a clean, moisturised face, and we go through skincare prep together." },
    { k: "h3", t: "The wait-and-see test." },
    { k: "p", t: "We finish the application, hand you a mirror, and then ask you to sit with it for five minutes. Fresh foundation settles into the skin, and I want you to see it after your own body heat has warmed it — not only in studio lighting under a ring light. We do a final check-in after that settling period to make any tweaks." },

    { k: "h2", id: "prepare", nav: "How to prepare", t: "How to prepare: the do's and don'ts" },
    { k: "h3", t: "DO wear a white top, or your actual wedding neckline." },
    { k: "p", t: "Makeup reflects light differently against white than against a black t-shirt. Wear a crew-neck white top so you can see how your foundation reads against the colour you will actually be wearing. If you have your veil or a necklace you plan to wear, bring those too — they change where we place your bronzer." },
    { k: "h3", t: "DON'T exfoliate or try new acids the night before." },
    { k: "p", t: "This is the golden rule. The day before your trial, use your gentlest cleanser and skip the retinols, the AHA and BHA exfoliators, and the pore strips." },

    { k: "h2", id: "five", nav: "The final five questions", t: "The final five questions you must ask" },
    { k: "p", t: "You already have the standard list — how many weddings, how many years. Those are the basics. To get the real insight, and to avoid surprises on the day, ask these five instead." },
    ...TRIAL_QUESTIONS.map(([t, b], i): Block => ({ k: "num", n: String(i + 1), t, b })),

    { k: "h2", id: "verdict", nav: "Take notes, literally", t: "The final verdict: take notes, literally" },
    { k: "p", t: "When the trial is over, do not simply thank them and leave. Narrate what you love and what you might change — the eyes are perfect, but I want the blush a touch peachier." },
    { k: "p", t: "Email those notes to your artist the next day. It creates a written blueprint for your wedding morning, so even if you are nervous and sleep-deprived, there is a record of exactly what perfection looked like at the trial." },
    { k: "quote", t: "A successful bridal trial isn't about looking perfect on a random Tuesday afternoon. It is about building trust." },
    { k: "p", t: "When you leave that chair and look in the mirror, you should feel a wave of relief — because you finally know, without a doubt, that you are in safe hands." },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════════
   The kit
   ═══════════════════════════════════════════════════════════════════════════ */

const KIT_ESSENTIALS: [string, string][] = [
  [
    "A daylight-balanced LED panel — and the battery to run it.",
    "Getting-ready rooms are lit for sleeping, not for makeup: one warm bulb overhead, or a single window that moves across the morning. Match a foundation under the wrong colour temperature and skin that looked seamless indoors goes ashy in every photograph. A small bi-colour panel fixes it — but only if it runs off its own battery, because you cannot assume a socket. See number three.",
  ],
  [
    "A folding stool.",
    "The chair is the bride's. The height is yours. Working over someone perched on the edge of a hotel bed for eleven hours is how artists end up with shoulder injuries in their thirties. A light folding stool puts you at her eye level, which steadies your hand and, more importantly, lets you see the face straight on instead of from above — which is not the angle anyone will see her from all day.",
  ],
  [
    "A three-metre extension lead with four sockets.",
    "Hot tools, the light, a phone, and the one wall socket is behind the bed. This is the most borrowed thing in my bag — hairstylists, photographers, a videographer charging a battery. It costs almost nothing, and it buys you the corner of the room with the best light instead of the corner with the plug.",
  ],
  [
    "A box of bendy straws.",
    "Once the lip is set, a bride will simply stop drinking rather than risk it, and then she is dehydrated and lightheaded through a ceremony in forty-degree heat. A straw removes the choice. It is the least glamorous item on this list and the one I get thanked for most.",
  ],
  [
    "Safety pins in three sizes, fashion tape, and a small sewing kit.",
    "You will be asked. A hook goes, a pleat drops, a strap gives out twenty minutes before the entry — and you are the person in the room holding a bag of solutions. Strictly speaking it is not your job, which is exactly why doing it is remembered. Three sizes, because the pin that holds a heavy dupatta will tear a georgette.",
  ],
];

const kitEssentials: Post = {
  slug: "kit-essentials",
  kicker: "The Kit",
  title: "5 Non-Makeup Essentials I Never Leave Home Without",
  dek: "The items you will never see in a beauty influencer's kit tour — and the ones that have rescued me more times than I can count.",
  date: "July 2026",
  read: "6 min read",
  hero: kitEssentialsHero,
  alt: "A palette held up beside a face mid-application, character work in progress",
  pos: "58% 40%",
  body: [
    { k: "lead", t: "Every kit tour looks the same: the palettes, the brush roll, the airbrush compressor. Nobody films the outside pocket — which is where the things that actually save a morning live." },
    { k: "p", t: "I have worked jobs where the foundation match was flawless and the day still nearly came apart. Because the room was lit by one tungsten bulb. Because there was no socket within three metres of the chair. Because the bride had not had a sip of water in four hours and would not risk her lip." },
    { k: "p", t: "None of those are makeup problems. All of them are makeup artist problems. These are the five non-makeup things that live in my bag permanently, and why." },

    { k: "h2", id: "half", nav: "The kit is half the job", t: "Your kit is only half the job" },
    { k: "h3", t: "You are not being booked for products." },
    { k: "p", t: "A bride is paying for a face that holds for fourteen hours, in a room you have never seen, on a schedule that will slip. Your palettes handle the first part of that sentence. Everything after the comma is logistics — and logistics is the part you can actually control, by packing for it." },
    { k: "h3", t: "Everything here has failed me once." },
    { k: "p", t: "This is not a list assembled from other people's kit tours. Every item is on it because its absence once cost me time on a real job, in front of a real client, while a photographer stood waiting." },

    { k: "h2", id: "five", nav: "The five that earn their weight", t: "The five that earn their weight in the bag" },
    { k: "p", t: "In rough order of how often they come out." },
    ...KIT_ESSENTIALS.map(([t, b], i): Block => ({ k: "num", n: String(i + 1), t, b })),

    { k: "h2", id: "pocket", nav: "The outside pocket", t: "What lives in the outside pocket" },
    { k: "p", t: "Not the kit, not the five — the things I want to reach without unzipping anything. A lint roller. Hand sanitiser. A pack of tissues. Two spare hair ties. A charging cable for whichever phone is dying. And a pen." },
    { k: "p", t: "The pen is not an afterthought. It is for the notes from the trial, which is the other half of a morning that goes smoothly — and the thing I would put at number one if this list were allowed six." },
    { k: "quote", t: "Your kit is what you get judged on. Your bag is what gets you through the day." },

    { k: "h2", id: "build", nav: "Build your own list", t: "Build your own list, from your own disasters" },
    { k: "p", t: "Copy this list if it helps, but do not stop at it. After every wedding, write down the one moment you had to improvise: the thing you borrowed, the thing you went hunting for, the thing you wished you had. Within a season you will have a list specific to the venues you actually work in, and it will be better than mine." },
    { k: "p", t: "Pack for the room you have never seen. That is the whole discipline." },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════════
   The registry
   ═══════════════════════════════════════════════════════════════════════════ */

/** Newest first. New posts go on top — that is what makes them the landing
 *  post, and what moves the previous one into the "keep reading" tile. */
export const POSTS: Post[] = [bridalTrial, kitEssentials];

/** Where blog.html lands with no query on it. There is no index page, so the
 *  newest post IS the blog's front door — which is also why the bar's "Blog"
 *  entry points at a bare ./blog.html and never at a slug. */
export const LATEST_POST: Post = POSTS[0];

/** Every post is one static URL on one document. The slug rides in the query
 *  string rather than the path because the site builds to plain files with no
 *  SPA fallback: /blog/kit-essentials would 404 against static assets, while
 *  blog.html?post=kit-essentials is a real file with an argument. */
export function postHref(post: Post): string {
  return `./blog.html?post=${post.slug}`;
}

/** An unknown or missing slug falls through to the newest post rather than
 *  throwing: a stale link out of somebody's WhatsApp thread should still land
 *  on something worth reading. */
export function postBySlug(slug: string | null | undefined): Post {
  return POSTS.find((p) => p.slug === slug) ?? LATEST_POST;
}

/** What the "keep reading" tile points at: the next post down the list, and
 *  the newest again once you reach the end — so the tile is never empty and
 *  the oldest post is not a dead end. Null only while there is a single post
 *  on the site, where the tile could only link to the page you are reading. */
export function nextPost(post: Post): Post | null {
  if (POSTS.length < 2) return null;
  const i = POSTS.findIndex((p) => p.slug === post.slug);
  return POSTS[(i + 1) % POSTS.length];
}

/** The contents rail, derived from the post rather than written beside it. A
 *  hand-listed rail was one more thing to keep in sync per post, and the two
 *  drifting apart shows up as an entry that scrolls nowhere. */
export function toc(post: Post): TocEntry[] {
  const entries: TocEntry[] = [];
  for (const b of post.body) {
    if (b.k === "h2" && b.id) entries.push({ id: b.id, label: b.nav ?? b.t });
  }
  return entries;
}
