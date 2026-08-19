/* Regenerates src/data.blur.ts — the blur-up placeholders the portfolio grid
   shows while a photo is still downloading.
 *
 * Run it with `npm run blur` after adding, replacing or re-cropping anything
 * under src/assets. Nothing runs it automatically: the output is committed, so
 * the app builds without sharp and `npm ci` on CI never touches it. That is the
 * whole reason this is a script and not a Vite plugin — the placeholders change
 * about as often as the photographs do, which is to say almost never, and
 * paying for them on every cold build would be silly.
 *
 * Each placeholder is a WebP resized to WIDTH px on its long edge and encoded
 * as a data URI. At 20px the file lands around 200–400 bytes, which is small
 * enough to inline 18 of them and still be a fraction of one real photo. It is
 * also small enough that upscaling it to tile size is inherently soft — the CSS
 * blur in the component is smoothing the block edges, not creating the effect.
 *
 * Aspect ratio is deliberately preserved rather than cropped to the tile. The
 * component paints these with the same object-position the real photo uses, so
 * a placeholder cropped here would be cropped twice and slide off the frame. */
import { Buffer } from "node:buffer";
import { readdir, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const WIDTH = 20;
/* Low, because every artefact this introduces is about to be blurred away. */
const QUALITY = 45;

const root = fileURLToPath(new URL("..", import.meta.url));
const assets = join(root, "src", "assets");
/* Only the folders the portfolio grid draws from. gallery/ and nagasushmitha/
   are left out deliberately: nothing in `works` uses them, and every entry here
   ships inline in the JS whether a tile references it or not — an object
   literal's unused properties cannot be tree-shaken away. Add a folder here the
   moment a works entry needs one, and the missing key is a compile error in
   data.ts rather than a silent blank. */
const FOLDERS = ["bridal", "editorial"];
const IMAGE = /\.(jpe?g|png|webp|avif)$/i;

/** "bridal/IMG_3877.webp" — the path as data.ts spells it, minus "./assets/",
 *  so the key next to a `src:` import reads as the same file. */
function keyFor(file) {
  return relative(assets, file).split(/[\\/]/).join("/");
}

async function placeholder(file) {
  const webp = await sharp(file)
    .resize(WIDTH, WIDTH, { fit: "inside" })
    .webp({ quality: QUALITY })
    .toBuffer();
  return `data:image/webp;base64,${webp.toString("base64")}`;
}

const files = [];
for (const folder of FOLDERS) {
  const dir = join(assets, folder);
  for (const name of await readdir(dir)) {
    if (IMAGE.test(name)) files.push(join(dir, name));
  }
}
files.sort();

const entries = [];
for (const file of files) {
  entries.push([keyFor(file), await placeholder(file)]);
}

const body = entries
  .map(([key, uri]) => `  ${JSON.stringify(key)}: ${JSON.stringify(uri)},`)
  .join("\n");

const out = `/* GENERATED FILE — do not edit by hand.
   Written by scripts/generate-blur.mjs; run \`npm run blur\` to refresh.

   One blur-up placeholder per photo under src/assets, keyed by the path
   data.ts spells after "./assets/". Each is a ${WIDTH}px WebP as a data URI, so
   it costs a few hundred bytes and no request.

   The key type is a union of exactly these paths rather than \`string\`, which
   is what makes a renamed or deleted photo a compile error in data.ts instead
   of a tile that quietly falls back to no placeholder at all. */
export const blurs = {
${body}
} as const;

export type BlurKey = keyof typeof blurs;
`;

const dest = join(root, "src", "data.blur.ts");
await writeFile(dest, out, "utf8");

const bytes = entries.reduce((n, [, uri]) => n + uri.length, 0);
console.log(
  `${entries.length} placeholders → src/data.blur.ts (${(bytes / 1024).toFixed(1)} kB of data URI)`,
);
