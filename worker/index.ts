/**
 * The entry point Cloudflare deploys.
 *
 * On Pages the directory layout was the router: functions/api/enquiry.ts
 * answered /api/enquiry with no configuration. Workers have no such
 * convention, so the dynamic routes are mapped here by hand and everything
 * else is handed to the static assets built into dist/.
 *
 * The enquiry handler itself is untouched and still lives at its old path,
 * where the filename goes on documenting the route it serves. It was already
 * written against Web standards — Request in, Response out, configuration
 * through `env` — which is exactly what a Worker's fetch handler receives, so
 * this file is a router and nothing more. The dev-server adapter in
 * vite.config.ts loads the same module, so all three environments run one copy
 * of the send logic.
 */
import { onRequest } from "../functions/api/enquiry";
import { holdingPage } from "./holding";

/* Hand-written rather than pulled from @cloudflare/workers-types, matching how
   vite.config.ts narrows the same handler: one method is used, so one method
   is declared, and the project keeps its dependency list short. */
interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  RESEND_API_KEY?: string;
  ENQUIRY_TO?: string;
  ENQUIRY_FROM?: string;

  /* Declared in wrangler.jsonc, once per environment. Absent under `npm run
     dev`, where process.env is the binding and nothing sets it. */
  ENVIRONMENT?: string;

  /* The launch switch. See `launched` below — the string comparison there is
     deliberate. */
  LAUNCHED?: string | boolean;

  /* Public, and only used by the holding page. The site itself gets the number
     from VITE_WHATSAPP_NUMBER, which Vite inlines at build time and which the
     Worker therefore cannot read at runtime. */
  WHATSAPP_NUMBER?: string;

  /* The version_metadata binding: which upload of this script is answering.
     Optional because the dev server has no such thing to provide. */
  CF_VERSION_METADATA?: { id: string; tag?: string; timestamp?: string };
}

/* Mirrors src/data.ts, which cannot be imported here: it imports .webp files,
   and the Worker bundle has no loader for those. Two constants, on a page that
   is deleted at launch — cheaper than reshaping data.ts around it. */
const INSTAGRAM_URL = "https://www.instagram.com/nagasushmithamakeupartist/";
const INSTAGRAM_HANDLE = "@nagasushmithamakeupartist";
const EMAIL = "contact@nsmakeupartistry.com";

/**
 * Whether the site is open to the public.
 *
 * Compared as a string because the same value can arrive two ways: as a real
 * boolean from `vars` in wrangler.jsonc, or as the string "true" if it is ever
 * set in the dashboard, which stores every variable as text. `=== true` would
 * quietly keep the site closed in the second case, on launch morning, which is
 * the worst possible time to discover a type mismatch.
 */
const launched = (env: Env): boolean => String(env.LAUNCHED) === "true";

/** Staging is a public URL. Whatever else it is, it must not be a second copy
 *  of the site in Google's index, competing with the real one at launch. */
function noindex(response: Response): Response {
  /* Rebuilt rather than mutated: responses returned by the ASSETS binding have
     immutable headers, and assigning to them throws. */
  const copy = new Response(response.body, response);
  copy.headers.set("x-robots-tag", "noindex, nofollow");
  return copy;
}

/**
 * GET /api/health — which Worker is this, is it launched, and is it configured?
 *
 * Exists because the questions that go wrong on this project are all invisible
 * from the outside. A deploy that never ran looks exactly like a deploy that
 * did: the site still loads, just with last week's markup, and the only tell is
 * comparing hashed asset filenames against a local build. A missing
 * RESEND_API_KEY looks exactly like a broken one — the form reports the same
 * failure either way. And a browser holding a stale cache looks exactly like a
 * server serving stale content, which is the more alarming of the two and the
 * less likely.
 *
 * So this reports the environment, the deployed version, the launch state, and
 * whether each piece of enquiry config arrived. Pointed at the custom domain,
 * it says whether the domain is attached to the Worker that actually receives
 * deploys. Answered from a terminal, it also bypasses the browser cache that
 * causes most of the confusion in the first place.
 *
 * Values are never returned, only whether they are set. `from` is the
 * exception — it is not a secret, it is stamped on every email that goes out,
 * and it is the field most likely to be wrong in a way Resend refuses with a
 * 403 rather than a bounce.
 */
function health(env: Env): Response {
  const version = env.CF_VERSION_METADATA;

  return new Response(
    JSON.stringify(
      {
        environment: env.ENVIRONMENT ?? "unknown",
        launched: launched(env),
        version: version?.id ?? null,
        deployedAt: version?.timestamp ?? null,
        enquiry: {
          /* The two the handler refuses to start without. */
          resendKey: Boolean(env.RESEND_API_KEY),
          to: Boolean(env.ENQUIRY_TO),
          from: env.ENQUIRY_FROM ?? "(unset — handler will use its default)",
        },
      },
      null,
      2,
    ),
    {
      headers: {
        "content-type": "application/json; charset=utf-8",
        /* A cached answer would defeat the entire purpose: this gets read
           immediately after a deploy, to find out whether that deploy is the
           one replying. */
        "cache-control": "no-store",
      },
    },
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    /* Both API routes sit above the gate: it hides the *site*, not the
       endpoints. /api/health is how you check the gate is set the way you think
       it is, and /api/enquiry needs to be verifiable on the production Worker —
       with production's own key and addresses — before launch day rather than
       during it. Neither is linked from the holding page, and the enquiry
       handler is exactly as exposed here as it will be afterwards. */
    if (pathname === "/api/health") return health(env);
    if (pathname === "/api/enquiry") return onRequest({ request, env });

    /* Before launch the domain serves one page and nothing else — no markup,
       no images, no bundle. The gate sits above the assets rather than beside
       them because a single un-gated path is enough to leak the whole site:
       dist/ carries every photograph and every price, under names that are
       guessable from a sitemap or an old crawl.

       This is only reached at all because `assets.run_worker_first` is set on
       production in wrangler.jsonc. Cloudflare otherwise answers asset
       requests at the edge without ever invoking the Worker, and this check
       would never run. The two settings are one mechanism; flipping LAUNCHED
       without also clearing run_worker_first leaves the site working but
       paying an invocation per request. */
    if (!launched(env)) {
      return holdingPage({
        instagram: INSTAGRAM_URL,
        instagramHandle: INSTAGRAM_HANDLE,
        email: EMAIL,
        whatsapp: env.WHATSAPP_NUMBER
          ? `https://wa.me/${env.WHATSAPP_NUMBER.replace(/\D/g, "")}`
          : undefined,
      });
    }

    /* Reached only when the path matched no built file — unless the Worker is
       running first, in which case every asset comes through here too. */
    const response = await env.ASSETS.fetch(request);

    return env.ENVIRONMENT === "preview" ? noindex(response) : response;
  },
};
