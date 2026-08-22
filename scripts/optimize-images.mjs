/**
 * Resizes the photography down to what the page actually paints.
 *
 * The originals are camera and export resolution — NS_Banner_1 arrived at
 * 8088x4949, forty megapixels, for a band that is never taller than 700 CSS px.
 * Nothing on the page can show more than a fraction of that, so the rest is
 * bandwidth spent to be thrown away by the decoder, and on a slow connection it
 * is spent in front of the visitor: the banner is the LCP element, so its file
 * size *is* the number Lighthouse reports.
 *
 * ── How it works ──────────────────────────────────────────────────────────
 * assets-original/ is the source of truth. The first run moves each photograph
 * there and writes a resized copy back into src/assets in its place; every run
 * after that re-derives from the backup. That is what makes the caps below
 * editable: raising one and re-running goes back to the full-resolution file
 * rather than upscaling whatever the last run left behind. It also means
 * src/assets holds derived files — the thing to archive is assets-original/.
 *
 * Formats are never converted. A .webp stays WebP and a .jpg stays JPEG,
 * because data.ts picks between formats by extension (FORMATS_BY_PREFERENCE)
 * and re-encoding a photo into a format its neighbours do not have would change
 * which one it picks. Only the pixel dimensions and the quality change.
 *
 * Placeholders do not need regenerating afterwards: `npm run blur` keys on the
 * path and downsamples to 20px, which is the same picture either way.
 *
 * Run with `npm run images`.
 */

import { readdir, mkdir, copyFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const ASSETS = path.join(ROOT, "src", "assets");
const ORIGINALS = path.join(ROOT, "assets-original");
const PUBLIC = path.join(ROOT, "public");

/**
 * The cap for each folder, in CSS px of the largest box that ever shows it,
 * doubled where the element is small enough that a retina screen would notice.
 *
 * `fit: "inside"` throughout, so these are a bounding box rather than a crop —
 * a portrait hits the height first and a landscape the width, and neither is
 * distorted or cropped. Every crop on this site is done by the browser through
 * background-position or object-fit, and those are all percentages, so shrinking
 * a source does not move a single one of them.
 */
const RULES = [
  {
    /* Full-bleed, and never taller than 700px (88svh on phones). A 1440px
       viewport at DPR 2 is the widest thing that can genuinely use pixels here;
       past that the band is so short that width is what binds. */
    match: /[/\\]banner[/\\]/,
    width: 2400,
    height: 1400,
    quality: 74,
  },
  {
    /* One column of a two-column grid — around 560px at the shell's widest. */
    match: /[/\\]nagasushmitha[/\\]/,
    width: 1200,
    height: 1600,
    quality: 76,
  },
  {
    /* Portfolio and gallery-strip tiles, and the lightbox behind them. The
       lightbox is what sets this rather than the tiles: it goes to the height
       of the viewport, so a tall phone at DPR 3 is the demanding case. */
    match: /[/\\](bridal|party|editorial|gallery)[/\\]/,
    width: 1600,
    height: 2000,
    quality: 76,
  },
  {
    /* The nav mark, at most 32px tall on screen. Kept generous anyway because
       it is a flat illustration and PNG at this size costs almost nothing. */
    match: /logo\.(png|webp)$/,
    width: 240,
    height: 240,
    quality: 90,
  },
];

/** Everything that is not photography and must be passed over untouched. */
const SKIP = /[/\\]fonts[/\\]/;

/* Above this, a file is being stored far more precisely than a photograph on a
   web page needs — 0.25 is already a generous lossy WebP. Chosen as a floor for
   "leave it alone" rather than a target: the re-encode below aims well under
   it, and this only decides which files are worth touching at all. */
const MAX_BYTES_PER_PIXEL = 0.25;

const ENCODERS = {
  webp: (image, quality) => image.webp({ quality, effort: 6 }),
  jpeg: (image, quality) => image.jpeg({ quality, mozjpeg: true }),
  png: (image) => image.png({ compressionLevel: 9, palette: true }),
  avif: (image, quality) => image.avif({ quality }),
};

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

function ruleFor(file) {
  return RULES.find((rule) => rule.match.test(file));
}

const kB = (bytes) => `${(bytes / 1024).toFixed(0)} kB`;

async function process(file) {
  if (SKIP.test(file)) return null;

  const rule = ruleFor(file);
  if (!rule) return null;

  /* The backup is both the archive and the input. Taking it on the first run
     is what makes every run after that idempotent — the caps are applied to
     the full-resolution photograph each time, never to an already-shrunk one,
     so re-running never compounds the loss. */
  const relative = path.relative(ROOT, file);
  const backup = path.join(ORIGINALS, relative);
  if (!existsSync(backup)) {
    await mkdir(path.dirname(backup), { recursive: true });
    await copyFile(file, backup);
  }

  const before = (await stat(backup)).size;
  const image = sharp(backup, { failOn: "none" });
  const meta = await image.metadata();

  /* Dimensions are only half of it. A good few of these are modest on paper —
     NS_Bridal_7 is 654x863 — and still over a megabyte, because they were
     exported as lossless WebP: 2.17 bytes per pixel, which is more than the raw
     RGB would have been. Nothing about the size on screen reveals that, so the
     second test is density. Anything already under this is left alone;
     re-encoding a reasonable file only spends quality to save nothing. */
  const density = before / (meta.width * meta.height);
  const oversized = meta.width > rule.width || meta.height > rule.height;
  if (!oversized && density <= MAX_BYTES_PER_PIXEL) {
    return { relative, before, after: before, skipped: true, meta };
  }

  const encode = ENCODERS[meta.format];
  if (!encode) {
    console.warn(`  ? ${relative} — no encoder for ${meta.format}, left alone`);
    return null;
  }

  await encode(
    image.resize({
      width: rule.width,
      height: rule.height,
      fit: "inside",
      withoutEnlargement: true,
    }),
    rule.quality,
  ).toFile(file);

  const after = (await stat(file)).size;
  return { relative, before, after, meta };
}

const results = [];
for (const dir of [ASSETS, PUBLIC]) {
  if (!existsSync(dir)) continue;
  for await (const file of walk(dir)) {
    const result = await process(file);
    if (result) results.push(result);
  }
}

let before = 0;
let after = 0;
for (const r of results.sort((a, b) => b.before - a.before)) {
  before += r.before;
  after += r.after;
  if (r.skipped) continue;
  const saved = ((1 - r.after / r.before) * 100).toFixed(0);
  console.log(
    `  ${r.relative.padEnd(46)} ${String(r.meta.width).padStart(5)}px  ` +
      `${kB(r.before).padStart(8)} → ${kB(r.after).padStart(8)}  (-${saved}%)`,
  );
}

console.log(
  `\n  ${results.length} files: ${kB(before)} → ${kB(after)} ` +
    `(-${((1 - after / before) * 100).toFixed(0)}%). ` +
    `Originals in assets-original/.`,
);
