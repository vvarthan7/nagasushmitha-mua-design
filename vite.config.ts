import type { IncomingMessage, ServerResponse } from "node:http";
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/* Rendered to markup by firstPaint below and dropped into index.html, so both
   sections are in the document the browser is served rather than something
   React draws on arrival. They are imported rather than transcribed, so the
   markup and the components cannot come to say different things — which is only
   possible because neither file imports anything itself. Vite loads this config
   by bundling it with esbuild, relative imports and all, and esbuild has no
   loader for a .webp: one image import anywhere in this graph and the config
   stops loading, which takes the dev server and the build down with it. Both
   files carry a note saying so; read it before adding an import to either. */

type PagesFunction = (context: {
  request: Request;
  env: NodeJS.ProcessEnv;
}) => Promise<Response>;

/** Node's request as the Web one Cloudflare hands the Worker. */
async function toWebRequest(req: IncomingMessage): Promise<Request> {
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (typeof value === "string") headers.set(name, value);
    else if (Array.isArray(value))
      for (const one of value) headers.append(name, one);
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
  return new Request(`http://localhost${req.url ?? "/"}`, {
    method,
    headers,
    body,
  });
}

/** ...and back again, so Node can write what the handler returned. */
async function writeWebResponse(
  res: ServerResponse,
  response: Response,
): Promise<void> {
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
          const module = await server.ssrLoadModule(
            "/functions/api/enquiry.ts",
          );
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

export default defineConfig(({ mode }) => {
  /* The handler reads RESEND_API_KEY from process.env, which Vite does not
     populate on its own. Loading with an empty prefix picks up unprefixed
     secrets from .env.local; note this is a plain file read, *not* the
     client-side `import.meta.env` — envPrefix is still the default VITE_, so
     the key cannot reach the browser bundle. */
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));

  return {
    plugins: [react(), tailwindcss(), enquiryApi()],

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
