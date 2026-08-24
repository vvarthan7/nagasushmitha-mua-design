import { readdirSync, readFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

type PagesFunction = (context: {
  request: Request;
  env: NodeJS.ProcessEnv;
}) => Promise<Response>;

/** Node's request as the Web one Cloudflare hands the Worker. */
async function toWebRequest(req: IncomingMessage): Promise<Request> {
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (typeof value === "string") headers.set(name, value);
    else if (Array.isArray(value)) for (const one of value) headers.append(name, one);
  }

  const method = req.method ?? "GET";

  /* Decoded to a string rather than passed through as bytes. Two competing
     BodyInit definitions are in scope here — the DOM lib's and the one
     @types/node brings with undici — and a string is the one shape both agree
     on. No loss either: the single route this serves is JSON. */
  let body: string | undefined;
  if (method !== "GET" && method !== "HEAD") {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(Buffer.from(chunk));
    body = Buffer.concat(chunks).toString("utf8");
  }

  /* The origin is a formality — the handler routes on nothing but the method,
     and the middleware mount has already stripped the path. */
  return new Request(`http://localhost${req.url ?? "/"}`, { method, headers, body });
}

/** ...and back again, so Node can write what the handler returned. */
async function writeWebResponse(res: ServerResponse, response: Response): Promise<void> {
  res.statusCode = response.status;
  response.headers.forEach((value, name) => res.setHeader(name, value));
  res.end(Buffer.from(await response.arrayBuffer()));
}

/**
 * Runs functions/api/enquiry.ts on the dev server, so the contact form works
 * end to end under `npm run dev` rather than only once deployed — and without
 * needing `wrangler dev` running alongside Vite.
 *
 * The handler speaks the Worker runtime's dialect: Web Request in, Web Response
 * out, configuration through `env`. Node's dev server speaks none of those, so this
 * translates in both directions and passes process.env as the binding. One
 * handler serves both, which is the point — a second copy of the send logic
 * would drift from the first.
 *
 * `apply: "serve"` because it is dev-only scaffolding. `vite build` emits
 * static files and nothing else; in production Cloudflare invokes the function
 * itself, and this plugin is not involved.
 */
function enquiryApi(): Plugin {
  return {
    name: "enquiry-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/api/enquiry", async (req, res, next) => {
        try {
          /* Loaded per request rather than imported at the top of this file so
             that edits to the handler take effect without a server restart. */
          const module = await server.ssrLoadModule("/functions/api/enquiry.ts");
          const response = await (module.onRequest as PagesFunction)({
            request: await toWebRequest(req),
            env: process.env,
          });
          await writeWebResponse(res, response);
        } catch (error) {
          server.config.logger.error(`[enquiry-api] ${String(error)}`);
          next(error);
        }
      });
    },
  };
}

/* The banner's photographs, in the order HeroReel cross-dissolves them — which
   is the order data.ts names them and the order a plain sort gives, so long as
   the folder holds NS_Banner_1 through _4 and nothing else. The folder belongs
   to the banner alone, so reading it is what keeps this list in step with
   data.ts; a second hard-coded copy of the four names is the thing that would
   quietly rot. Renumber past _9 and the sort stops agreeing — see the numeric
   collation note in data.ts. */
const BANNER_DIR = fileURLToPath(new URL("./src/assets/banner", import.meta.url));
const BANNER_IMAGE = /\.(avif|webp|jpe?g|png)$/i;

/**
 * Resolves one banner file to the URL the served page will ask for.
 *
 * The href has to come from the bundle rather than from the source path,
 * because the emitted file is content-hashed. `originalFileNames` is rollup's
 * own record of which source each asset came from, so the mapping is exact
 * rather than a guess at what the hashed name looks like. In dev there is no
 * bundle and Vite serves the file where it lies.
 *
 * `./` assumes the document lands at the root of outDir, which index.html does.
 * Vite works the prefix out per document for the tags it injects itself, so a
 * page one directory down gets `../assets/...` from Vite and `./assets/...`
 * from here — fine while this only ever fires on the root index.html, and the
 * thing to fix first if that check is ever widened.
 */
function emittedHref(
  source: string,
  bundle: Parameters<
    Extract<Plugin["transformIndexHtml"], { handler: unknown }>["handler"]
  >[1]["bundle"],
): string | undefined {
  if (!bundle) return `/${source}`;

  const name = source.slice(source.lastIndexOf("/") + 1);
  for (const output of Object.values(bundle)) {
    if (
      output.type === "asset" &&
      /* Matched on the file name alone. These are unique across src/assets, so
         there is nothing to disambiguate, and it sidesteps the question of
         which separator rollup recorded the source path with. */
      output.originalFileNames.some((from) => from.endsWith(name))
    ) {
      return `./${output.fileName}`;
    }
  }
  return undefined;
}

/* Frame 1's 20px placeholder, lifted out of the generated data.blur.ts.

   Read rather than imported because this file is Node's, not the bundle's — a
   TypeScript import here would need its own transform step for one string. The
   file is generated with a fixed shape (`npm run blur`), so a regex over it is
   stable; it is still the same single source of truth the component draws
   from, which is the point. */
const BLUR_FILE = fileURLToPath(new URL("./src/data.blur.ts", import.meta.url));

function coverBlur(): string | undefined {
  const source = readFileSync(BLUR_FILE, "utf8");
  const match = source.match(
    /"banner\/NS_Banner_1\.webp":\s*"(data:image\/[^"]+)"/,
  );
  return match?.[1];
}

/* Which file the mark is, taken from Nav's own import rather than guessed at.
   src/assets holds both a logo.png and a logo.webp and only one of them is
   the bar's; picking the wrong one puts a mark in the boot bar that jumps to a
   different file the moment React mounts, and picking by hand here is how the
   two quietly come apart the next time that import is edited. */
const NAV_FILE = fileURLToPath(new URL("./src/components/Nav.tsx", import.meta.url));

function navMark(): string | undefined {
  const source = readFileSync(NAV_FILE, "utf8");
  const match = source.match(/^import\s+logo\s+from\s+"\.\.\/(.+)"/m);
  return match ? `src/${match[1]}` : undefined;
}

/**
 * Everything index.html can do for the banner before a line of JavaScript runs.
 *
 * Two jobs, both about the same gap: the banner is the largest thing above the
 * fold and the LCP element, and nothing on the page asks for it until React has
 * mounted — the browser must fetch, parse and run the bundle before it even
 * learns the photograph exists.
 *
 * 1. A <link rel="preload"> for frame 1, so that fetch starts during HTML parse
 *    instead. On a cold mobile connection that is most of a second.
 *
 *    Frame 1 only. The other three used to be preloaded too, at low priority,
 *    on the reasoning that low priority keeps them out of the way — it does not.
 *    Priority orders the queue; it does not stop the bytes sharing the pipe once
 *    they are in flight, and on a throttled connection three frames nobody sees
 *    for 6, 12 and 18 seconds were taking most of the bandwidth away from the
 *    one frame that decides LCP. They are fetched by HeroReel instead, once
 *    frame 1 has landed and the connection is free.
 *
 * 2. A boot layer inside #root: the top of the page, drawn in the markup — the
 *    bar with the mark in it, and frame 1's own 20px blur-up placeholder inline
 *    as a data URI behind it. It costs one small request and a few hundred
 *    bytes, and it paints on the HTML parser's first pass, seconds before the
 *    bundle has arrived on a slow connection.
 *
 *    It is the banner's box and no more — the same height rules REEL carries in
 *    HeroReel, so the page below it is ordinary white while it waits. An
 *    earlier version filled the viewport instead, which turned a page that was
 *    still loading into what looked like a full-screen splash screen and then a
 *    hard cut to the site.
 *
 *    Just the mark, not the links: the row is plain text behind a font that is
 *    still loading, so it is cheap enough to skip waiting for and let React
 *    draw the moment it mounts, rather than keeping a second copy of the bar's
 *    labels in this file to stay in sync with Nav.tsx.
 *
 *    Inside #root, not beside it, because that is what makes it self-clearing:
 *    createRoot() empties its container on the first commit, so the layer goes
 *    at exactly the moment React paints the real banner over it, with no
 *    teardown code and no window where both or neither is on screen.
 *
 * Home page only — gallery.html and blog.html render no banner.
 */
function bannerFirstPaint(): Plugin {
  return {
    name: "banner-first-paint",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        if (!ctx.filename.endsWith("index.html")) return;

        /* The folder belongs to the banner alone, so reading it is what keeps
           this in step with data.ts rather than a second hard-coded copy of
           the names. Frame 1 is the first by the same plain sort data.ts
           relies on. */
        const [cover] = readdirSync(BANNER_DIR)
          .filter((n) => BANNER_IMAGE.test(n))
          .sort();

        const href = cover
          ? emittedHref(`src/assets/banner/${cover}`, ctx.bundle)
          : undefined;
        const blur = coverBlur();
        const markSource = navMark();
        const mark = markSource
          ? emittedHref(markSource, ctx.bundle)
          : undefined;

        /* Skipped rather than guessed at: a preload pointing at a URL the page
           never requests is a wasted download, which is worse than no preload
           at all. */
        const tags = href
          ? [
              {
                tag: "link",
                attrs: {
                  rel: "preload",
                  as: "image",
                  href,
                  fetchpriority: "high",
                },
                injectTo: "head-prepend" as const,
              },
            ]
          : [];

        /* Without the placeholder there is nothing to show, and a bar over an
           empty dark rectangle is worse than letting React draw the lot. */
        if (!blur) return tags;

        /* A <style> rather than style attributes, because the box needs the
           same media query REEL uses and an attribute cannot carry one. It is
           inline in the document either way — the real stylesheet is a separate
           request, and none of this can afford to wait for it.

           Every value here is HeroReel's or Nav's, restated because Node cannot
           read Tailwind classes: the height rules from REEL, the 16px blur and
           1.1 scale from BLUR, the bar's 12px padding and the mark's clamped
           height from Nav. Drift shows up as the mark or the banner edge
           jumping when React mounts, which is the thing to look for if any of
           those change. The crop is frame 1's from data.ts — it moves colour
           around under 16px of blur, which is little enough that being a
           version behind is cosmetic rather than wrong. */
        const style =
          `#boot{position:fixed;top:0;left:0;right:0;height:700px;min-height:520px;` +
          `overflow:hidden;background:#2c1a1c;z-index:30}` +
          `@media(max-width:860px){#boot{height:min(88svh,700px)}}` +
          `#boot-img{position:absolute;inset:0;background:url(${blur}) 50% 20%/cover no-repeat;` +
          `filter:blur(16px);transform:scale(1.1)}` +
          `@media(max-width:860px){#boot-img{background-position:68% 20%}}` +
          `#boot-bar{position:absolute;top:0;left:0;right:0;padding:12px 0}` +
          `#boot-bar>div{display:flex;align-items:center;margin:0 auto;` +
          `max-width:1240px;padding:0 clamp(18px,4vw,44px)}` +
          `#boot-bar img{display:block;height:clamp(26px,4vw,32px);width:auto;` +
          `filter:drop-shadow(0 2px 6px rgba(44,26,28,.45))}`;

        /* The whole layer is aria-hidden: this is a picture of the banner, not
           the bar. Only the mark is drawn — no links, so nothing here ends up
           as a second set of the same destinations in the tab order or a
           second navigation announced to a screen reader that would then
           vanish mid-read when React replaces it with the real bar. */
        const boot =
          `<div id="boot" aria-hidden="true"><div id="boot-img"></div>` +
          `<div id="boot-bar"><div>` +
          (mark ? `<img src="${mark}" alt="">` : `<span></span>`) +
          `</div></div></div>`;

        const ROOT = '<div id="root"></div>';
        if (!html.includes(ROOT)) {
          /* Loud rather than silent: the mount point moved or was rewritten,
             and a boot layer injected in the wrong place is either invisible or
             permanent. */
          throw new Error(
            `banner-first-paint: expected ${ROOT} in index.html to inject the boot layer into.`,
          );
        }

        return {
          html: html.replace(ROOT, `<div id="root">${boot}</div>`),
          tags: [
            ...tags,
            {
              tag: "style",
              children: style,
              /* Appended, not prepended. It is close to a kilobyte, and
                 prepending it pushes <meta charset> past the first 1024 bytes
                 the parser sniffs the encoding from. Nothing is lost by the
                 later position: the real stylesheet is render-blocking anyway,
                 so both are in hand before the first paint either way. */
              injectTo: "head" as const,
            },
          ],
        };
      },
    },
  };
}

export default defineConfig(({ mode }) => {
  /* The handler reads RESEND_API_KEY from process.env, which Vite does not
     populate on its own. Loading with an empty prefix picks up unprefixed
     secrets from .env.local; note this is a plain file read, *not* the
     client-side `import.meta.env` — envPrefix is still the default VITE_, so
     the key cannot reach the browser bundle. */
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));

  return {
    plugins: [react(), tailwindcss(), enquiryApi(), bannerFirstPaint()],

    // Relative base, so the built pages do not care what prefix they are
    // served from — the domain root on Workers, a file:// path or `npm run
    // preview` locally.
    base: "./",

    build: {
      // Three documents, not one bundle with a router. Every .html listed here
      // becomes an entry, and because `base` is relative they all land wherever
      // the site is served from, with no SPA fallback or 404.html redirect needed
      // to make deep links work. Adding a page means a file here and an .html beside
      // index.html; anything they share is split into a common chunk.
      //
      // blog.html is the one entry that is not a single page: it renders
      // whichever post its ?post= slug names, defaulting to the newest. That is
      // deliberately a query rather than a path, because a path would need the
      // SPA fallback this setup does without — see src/components/content.ts.
      rollupOptions: {
        input: {
          main: "index.html",
          gallery: "gallery.html",
          blog: "blog.html",
        },
      },
    },

    // Vite's built-in asset list is lower-case only, and phone cameras write
    // .JPG / .HEIC. Without this, an uppercase file is handed to the JS parser
    // and the build dies on "invalid JS syntax".
    assetsInclude: [
      "**/*.JPG",
      "**/*.JPEG",
      "**/*.PNG",
      "**/*.WEBP",
      "**/*.AVIF",
    ],
  };
});
