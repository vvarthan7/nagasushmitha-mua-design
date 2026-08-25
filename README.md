# Naga Sushmitha — Bridal Makeup Artist

Marketing site for a Bangalore bridal makeup artist. React + TypeScript + Vite.

## Running it

```bash
npm install
npm run dev        # dev server with hot reload
npm run typecheck  # tsc in strict mode, no emit
npm run build      # typecheck, then production build into dist/
npm run preview    # serve the built dist/ locally
```

## Where things live

```
index.html            Vite entry (mounts #root)
tsconfig.json         Strict; tsc only type-checks, Vite does the transpiling
.env.example          Template for .env.local — WhatsApp number, Resend config
wrangler.jsonc        Deploy config — assets, non-secret vars, launch gate, preview env
worker/index.ts       Routes /api/enquiry and /api/health; gates the site pre-launch
worker/holding.ts     The page the domain serves until launch day
functions/            Server-side routes, deployed with the site
  api/enquiry.ts      The enquiry handler — a submission in, an email out
src/
  App.tsx             Section order for the whole page
  data.ts             All copy, image imports and links — edit content here
  types.ts            Shapes behind everything data.ts exports
  vite-env.d.ts       Vite asset/CSS-module types + the `--custom-property` hole
  hooks/              useScrolled: drives the condensed header + floating button
  components/         One .tsx + one .module.css per section
  styles/
    global.css        Design tokens (--plum, --blush, …), reset, marquee keyframes
    fonts.css         Self-hosted Manrope + Playfair Display @font-face
    shared.module.css Primitives reused verbatim across sections
  assets/
    gallery/          Bridal / reception shots and the service-panel photos
    editorial/        Editorial gallery shots, copied from images/editorial
    fonts/            woff2 subsets
```

Content is data-driven: to change a headline, a service tab, an FAQ or which
photos appear in the gallery, edit [src/data.ts](src/data.ts) — the components
read from it and need no changes. The shape of each list is declared in
[src/types.ts](src/types.ts), so a missing `alt` or a category that does not
exist is a build error rather than a blank space on the page.

## Pages

Three documents, no router. Each is an `.html` at the root, a matching entry
`.tsx` under `src/`, and a line in the `input` map in
[vite.config.ts](vite.config.ts); `base` is relative, so all three work from a
subpath with no SPA fallback.

| Document      | Entry              | Root component                       |
| ------------- | ------------------ | ------------------------------------ |
| `index.html`  | `src/main.tsx`     | [App.tsx](src/App.tsx)               |
| `gallery.html`| `src/gallery.tsx`  | [GalleryPage.tsx](src/GalleryPage.tsx) |
| `blog.html`   | `src/blog.tsx`     | [BlogPage.tsx](src/BlogPage.tsx)     |

`blog.html` is the one that is not a single page. It renders whichever post its
`?post=` slug names — `blog.html?post=kit-essentials` — and falls through to the
newest post when there is no slug, which is what the bar's **Blog** entry links
to. There is no index page: with a handful of posts, the newest one is a better
landing than a list of them.

### Publishing a post

Add one object to `POSTS` in
[src/components/content.ts](src/components/content.ts), **at the top of the
array** — that is the whole act of publishing. The array is ordered newest
first, which is what decides the landing post and what the "keep reading" tile
on each post points at. Everything else follows: the contents rail is derived
from the `h2` blocks in the body, and [JournalPost.tsx](src/components/JournalPost.tsx)
is the only layout, so no new component, `.html`, or build config is involved.

## The enquiry form

[Enquire.tsx](src/components/Enquire.tsx) POSTs its fields as JSON to
`/api/enquiry`, and [functions/api/enquiry.ts](functions/api/enquiry.ts) turns them into an email
through [Resend](https://resend.com). That handler is the only place the API
key exists.

It has to be that way round. `RESEND_API_KEY` is a bearer token for the whole
Resend account, so sending from a component would ship the key to every visitor
in the JS bundle and let any of them send mail as this domain; Resend also
refuses browser origins, so such a call fails on CORS even before that matters.

The handler calls Resend's REST API with `fetch` rather than using the `resend`
npm package. The SDK reaches for Node built-ins that exist on Workers only
behind the `nodejs_compat` flag, and one POST needs none of it — so there is no
dependency to bundle and nothing to break on a runtime upgrade. Same API the
SDK itself calls.

### Local setup

```bash
cp .env.example .env.local     # then paste a real key from resend.com/api-keys
npm run dev
```

`.env.local` is git-ignored. The dev server serves the handler through the
`enquiryApi` plugin in [vite.config.ts](vite.config.ts), which loads
`functions/api/enquiry.ts` per request, so the form works end to end under `npm run dev`
and edits to the handler need no restart.

| Variable                | Visibility  | What it does                                            |
| ----------------------- | ----------- | ------------------------------------------------------- |
| `VITE_WHATSAPP_NUMBER`  | **public**  | Every WhatsApp link on the site. Required — the guard ships in the bundle, so unset it throws on page load rather than showing a dead link. Non-digits are stripped, so `+91 …` is fine. |
| `RESEND_API_KEY`        | server only | Required. Without it the endpoint answers 500.           |
| `ENQUIRY_TO`            | server only | Where enquiries land. Required, and must be a full address including the domain suffix. Deployed builds read it from `wrangler.jsonc`, not the dashboard — see below. |
| `ENQUIRY_FROM`          | server only | The sender. Same: `wrangler.jsonc` when deployed.        |

The `VITE_` prefix is the whole of the difference. Vite inlines prefixed
variables into the JavaScript the browser downloads, so **anything named
`VITE_*` is published**, whether or not it looks like a secret. The WhatsApp
number is already public — it is a link people click. `RESEND_API_KEY` is not,
which is why it reaches the handler through Cloudflare's `env` binding instead
and must never be renamed into that namespace. Client-visible names are typed
in [vite-env.d.ts](src/vite-env.d.ts); the server-only ones are deliberately
absent from that list.

Until a domain is verified at [resend.com/domains](https://resend.com/domains),
Resend allows exactly one route: `onboarding@resend.dev` as the sender, and the
address the account was registered with as the recipient. Anything else comes
back as a 403 and the form shows its error state. Verifying the domain is what
lifts both limits and lets `ENQUIRY_FROM` become a real address at
nsmakeupartistry.com.

### Deploying to Cloudflare Workers

One Worker serves both halves: the static build, straight from Cloudflare's
edge, and `/api/enquiry` on the same origin. That is why no separate API host
was ever needed — no CORS preflight, no second deploy to keep in step, and no
endpoint URL to configure into the client. `/api/enquiry` is simply a path on
the site.

[wrangler.jsonc](wrangler.jsonc) is what makes that arrangement explicit:
`assets.directory` points at `dist/`, and `main` at
[worker/index.ts](worker/index.ts), which routes the two dynamic paths to their
handlers and hands everything else to the assets. Asset requests normally never
reach the Worker at all, so the three pages cost no invocations — only enquiries
do. That is suspended until launch; see below for why, and for how to put it
back.

> The config file is load-bearing for the build itself, not just for routing.
> Without one, `wrangler deploy` falls back to framework auto-detection, which
> for a Vite project tries to wire in `@cloudflare/vite-plugin` and fails the
> build outright on anything below Vite 6.

Nothing is built or deployed from your machine. Cloudflare clones the repo, runs
the build itself, and publishes the result.

#### Before launch: the domain is deliberately shut

The site has a launch date, and until it arrives `nsmakeupartistry.com` serves
[worker/holding.ts](worker/holding.ts) — a single self-contained page with the
WhatsApp, Instagram and email links on it — and nothing else. No markup, no
images, no bundle. Review happens on the preview Worker instead.

Two settings hold that in place, and they are one mechanism rather than two:

| Setting                         | Where                            | Why                                                                       |
| ------------------------------- | -------------------------------- | ------------------------------------------------------------------------- |
| `vars.LAUNCHED: false`          | [wrangler.jsonc](wrangler.jsonc) | The switch itself                                                          |
| `assets.run_worker_first: true` | [wrangler.jsonc](wrangler.jsonc) | Without it the Worker never sees a page request, so the switch never runs |

Cloudflare normally answers asset requests at the edge without invoking the
Worker at all — which is what makes the three pages free to serve, and which
would also make a gate inside the Worker completely ineffective. `dist/` carries
every photograph under a name that is guessable from an old crawl, so a gate
that only covered `index.html` would not be a gate.

The APIs stay open. `/api/health` has to be, or there is no way to check the
switch is set the way you think it is; `/api/enquiry` is deliberately reachable
so the Resend path can be proven on the production Worker — with production's own
key and addresses — before launch day rather than during it.

**On launch day**, one commit to `main`:

1. `wrangler.jsonc` → `"LAUNCHED": true`
2. `wrangler.jsonc` → delete `"run_worker_first": true` from the top-level
   `assets` block, so assets go back to being served at the edge for free.
   Leave the one in `env.preview` alone.
3. Optionally delete `WHATSAPP_NUMBER` from `vars` and
   [worker/holding.ts](worker/holding.ts) with it.

Then confirm, from a terminal rather than a browser tab:

```bash
curl -s https://nsmakeupartistry.com/api/health
```

`launched` should read `true` and `version` should be new.

#### Two Workers, one repo

| Branch    | Worker                     | URL                                                          |
| --------- | -------------------------- | ------------------------------------------------------------ |
| `main`    | `nsmakeupartistry`         | nsmakeupartistry.com — holding page until launch              |
| `preview` | `nsmakeupartistry-preview` | `nsmakeupartistry-preview.<subdomain>.workers.dev` — staging  |

They are separate Worker scripts, not two views of one, which is the point:
staging can be broken without the domain noticing. The `preview` entry in
[wrangler.jsonc](wrangler.jsonc)'s `env` block is what defines the second one,
and pushing to the `preview` branch is what builds it.

The consequence to remember is that **secrets do not cross between them**.
`RESEND_API_KEY` has to be added to each Worker once, separately. Everything
else lives in `vars` and deploys itself.

#### Where each variable goes, and why it matters

| Variable                     | Where it lives                                                   | When it is read                          |
| ---------------------------- | ---------------------------------------------------------------- | ---------------------------------------- |
| `VITE_WHATSAPP_NUMBER`       | Cloudflare → Settings → **Build** → variables                     | Build time — Vite inlines it into the JS |
| `RESEND_API_KEY`             | Cloudflare → Settings → **Variables and Secrets**, **encrypted**  | Request time, through `env`              |
| `ENQUIRY_TO`, `ENQUIRY_FROM` | [wrangler.jsonc](wrangler.jsonc), under `vars`                    | Request time, through `env`              |

That last row used to say "the dashboard", and it is the trap this project walked
into. `wrangler deploy` replaces the Worker's bindings with exactly what
`wrangler.jsonc` declares, so a **plain-text** variable typed into the dashboard
survives only until the next deploy and then vanishes. Nothing reports it. The
enquiry endpoint simply starts answering

```json
{ "error": "Email is not configured on the server yet." }
```

because `ENQUIRY_TO` is suddenly undefined — while the obvious suspect, the
Resend key, is not the culprit at all. Keeping the two addresses in the config
file makes deploys idempotent and puts them under review like any other change.

**Encrypted secrets are the exception.** They are stored separately and are
preserved across deploys, which is exactly why `RESEND_API_KEY` belongs there
and must never appear in `wrangler.jsonc` — that file is public.

The build variable is the other half of the split. `VITE_WHATSAPP_NUMBER` is
baked into the JavaScript, so changing it needs a fresh build, not just a save.

#### Checking that a deploy actually landed

`GET /api/health` on any deployment answers the questions that are otherwise
invisible from outside:

```bash
curl -s https://nsmakeupartistry.com/api/health
```

```json
{
  "environment": "production",
  "launched": false,
  "version": "b4f1…",
  "deployedAt": "2026-08-26T…",
  "enquiry": { "resendKey": true, "to": true, "from": "Naga Sushmitha <…>" }
}
```

`environment` says which Worker answered — pointing this at the custom domain is
how you confirm the domain is attached to the Worker that receives deploys,
rather than to an older one still sitting in the account. `version` changes on
every deploy, so it settles "is my push live?" without comparing hashed asset
filenames. The `enquiry` booleans report whether config arrived, without printing
the key.

To exercise the enquiry endpoint without sending mail, POST an empty body. The
handler checks its configuration before it reads anything, so `400 The enquiry
was empty` means the variables are present, and `500` means they are not:

```bash
curl -s -X POST -H "content-type: application/json" -d "" https://nsmakeupartistry.com/api/enquiry
```

Use a terminal, not a browser tab. A browser that has visited this domain before
may still be following a cached redirect from whatever used to be hosted here,
and will show you that instead of anything Cloudflare is serving.

#### One-time setup

Cloudflare dashboard → Workers & Pages → Create → Import a repository, pick this
repo, then:

| Setting                              | Value                               |
| ------------------------------------ | ----------------------------------- |
| Production branch                    | `main`                              |
| Build command                        | `npm run build`                     |
| Deploy command                       | `npx wrangler deploy --env=""`      |
| Non-production branch deploy command | `npx wrangler deploy --env preview` |

`--env=""` is not decoration. With more than one environment in the config,
`wrangler deploy` on its own warns that no target was given; naming the
top-level environment explicitly is what keeps the production deploy
unambiguous, now and after a wrangler upgrade.

Then add `VITE_WHATSAPP_NUMBER` under Build variables, and `RESEND_API_KEY` —
encrypted — under Variables and Secrets, once per Worker.

#### Renaming the Worker

Changing `name` in [wrangler.jsonc](wrangler.jsonc) does not rename anything. It
publishes to a **different** Worker and leaves the old one running, still serving
whatever it last built and still holding the custom domain. The site freezes on
old content, new variables appear to have no effect, and every dashboard screen
looks correct — because you are reading the new Worker's screens while the domain
is served by the old one.

If it has to change:

1. Deploy once under the new name, and check its workers.dev URL is current.
2. Old Worker → Settings → Domains & Routes → **remove** the custom domain.
3. New Worker → Settings → Domains & Routes → **add** it. Certificates take a
   few minutes.
4. Confirm with `/api/health` that the domain now reports the expected
   `environment` and a fresh `version`.
5. Delete the old Worker, so it cannot be mistaken for the live one later.

### The custom domain, with Google Workspace on it

Two things want DNS records, and one of them can break your email if it is done
carelessly. Read this before touching the registrar.

**Point the domain at the Worker.** An apex domain (`nsmakeupartistry.com`)
cannot be a CNAME, so it needs Cloudflare running DNS: add the site to
Cloudflare, then change the nameservers at your registrar. Only a `www`
subdomain could stay where it is, on a CNAME to
`<name>.<subdomain>.workers.dev`. Either way the domain is attached under the
Worker's Settings → Domains & Routes — as a Custom Domain, not a Route, so
Cloudflare issues the certificate and writes the DNS record itself.

> **Check the MX records before you flip the nameservers.** Moving DNS to
> Cloudflare moves *all* of it, Google Workspace's mail routing included.
> Cloudflare's onboarding scans your existing zone and usually imports the
> records, but it is a scan, not a guarantee. Compare the imported MX and TXT
> entries against the originals **while the old nameservers are still live**,
> and fix any gaps first. Get this wrong and mail to your domain stops arriving,
> with no error to tell you.

**Add `www` and a redirect.** The apex alone leaves `www.nsmakeupartistry.com`
resolving to nothing, which reads as "the site is down" to anyone who types it
out of habit. A Redirect Rule from `www` to the apex is enough, and it needs a
DNS record to exist for `www` before it can fire.

**Turn on Always Use HTTPS** (SSL/TLS → Edge Certificates), so `http://` is
redirected rather than answered.

**Verify a sending domain in Resend**, which is what lifts the sandbox: until
you do, Resend delivers only to the address the account was registered with, and
`ENQUIRY_TO` cannot be your Workspace inbox.

Use a **subdomain** — `send.nsmakeupartistry.com` — not the apex. A domain may
carry only one SPF record, and your apex already has Google Workspace's. Adding
Resend there means editing that record to merge both includes, and a mistake
takes down Workspace's outbound mail. A subdomain gets its own SPF, DKIM and
DMARC, entirely clear of Google's.

Add the records Resend gives you to the Cloudflare zone, leave them
**DNS-only** (grey cloud, not orange — proxying breaks mail records), and once
Resend reports verified, change `ENQUIRY_FROM` in
[wrangler.jsonc](wrangler.jsonc):

```jsonc
"ENQUIRY_FROM": "Naga Sushmitha <enquiries@send.nsmakeupartistry.com>"
```

The `from` has to sit on the verified subdomain. The `to` can then be anything,
including the Workspace mailbox — replies to it come from your normal inbox, and
visitors never see the `send.` subdomain.

#### Migrating a domain that used to serve something else

A domain moved from another host goes on serving that host in *your* browser long
after DNS is correct, because the old site's permanent redirect is cached locally
and never re-checked. Trust the network, not the tab: `curl -sI` from a terminal,
or a private window on another device, is the real answer. Clearing the browser's
cache for the site is what fixes the tab.

### Local development is unchanged

`npm run dev` still runs the function, through the `enquiryApi` plugin in
[vite.config.ts](vite.config.ts), which translates Node's request into the Web
`Request` the handler expects and passes `process.env` as its `env`. So
there is one handler, exercised the same way locally and in production, and no
need to run `wrangler dev` alongside Vite.
### Spam

The form carries an off-screen `company` honeypot that the handler treats as a
bot signal, answering 200 while sending nothing. That stops the naive
submitters; if real spam arrives, the next step is a rate limit keyed on IP or a
Turnstile check, both of which belong in the handler.

## Notes

- Fonts are self-hosted rather than loaded from Google Fonts, so the site has
  no third-party requests at runtime.
- `GalleryCategory` is a closed union (`"Bridal" | "Editorial"`). Adding a
  category means adding a folder under `src/assets`, a glob in `data.ts`, and a
  member to that union — the compiler points at every spot that needs updating.
- CSS custom properties set from JSX (`--hero-h`, `--dir`, `--veil`) are typed
  through a narrow `--*` index signature in `vite-env.d.ts`; a typo in a real
  CSS property is still caught.
- `shared.module.css` deliberately holds only classes that no component
  overrides. A composed class that a component also redeclares would resolve by
  stylesheet injection order, which is not guaranteed — keep overrides local.
- The event date field is a text input, not `<input type="date">`. A native
  date input ignores `placeholder` and renders in whatever format the browser's
  locale dictates, so a visitor in the US would be shown MM/DD/YYYY with no way
  to override it. The typed field is formatted and validated in
  [Enquire.tsx](src/components/Enquire.tsx); a real date input sits behind it,
  transparent and out of the tab order, so the calendar button beside it has
  something to open. Both halves enforce "after today": `min` on the picker,
  `validateDate` on what is typed.
- The enquiry form's fields are 14px on desktop but 16px below 860px, which
  looks like an inconsistency and is not one. Safari on iOS zooms the viewport
  in whenever a focused input's text is smaller than 16px, and the pages set
  `initial-scale=1` with no `maximum-scale` — pinch-zoom being something people
  need. Raising the mobile size is the only fix that does not take that away.
  Putting all four fields back to 14px would make every tap on the form shunt
  the layout sideways.
- The mobile breakpoint is 860px, matching the original layout.
- [legacy/index-bundle.html](legacy/index-bundle.html) is the original
  single-file build this project was reconstructed from, kept for reference.
