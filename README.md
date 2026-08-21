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
wrangler.jsonc        Deploy config — dist/ as static assets, worker/ as the entry
worker/index.ts       Routes /api/enquiry to the handler, everything else to assets
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
| `ENQUIRY_TO`            | server only | Where enquiries land. Required, and must be a full address including the domain suffix. |
| `ENQUIRY_FROM`          | server only | The sender.                                              |

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
nagasushmitha.com.

### Deploying to Cloudflare Workers

One Worker serves both halves: the static build, straight from Cloudflare's
edge, and `/api/enquiry` on the same origin. That is why no separate API host
was ever needed — no CORS preflight, no second deploy to keep in step, and no
endpoint URL to configure into the client. `/api/enquiry` is simply a path on
the site.

[wrangler.jsonc](wrangler.jsonc) is what makes that arrangement explicit:
`assets.directory` points at `dist/`, and `main` at
[worker/index.ts](worker/index.ts), which routes the one dynamic path to the
handler and hands everything else to the assets. Asset requests never reach the
Worker, so the three pages cost no invocations — only enquiries do.

> The config file is load-bearing for the build itself, not just for routing.
> Without one, `wrangler deploy` falls back to framework auto-detection, which
> for a Vite project tries to wire in `@cloudflare/vite-plugin` and fails the
> build outright on anything below Vite 6.

Nothing is built or deployed from your machine. Cloudflare clones the repo, runs
the build itself, and publishes the result on every push to `main`.

**One-time setup** — Cloudflare dashboard → Workers & Pages → Create → Import a
repository, pick this repo, then:

| Setting        | Value                                 |
| -------------- | ------------------------------------- |
| Build command  | `npm run build`                       |
| Deploy command | `npx wrangler deploy` *(the default)* |

Then add the four variables from `.env.example` — but they go in **two
different screens**, and putting one in the wrong screen fails quietly:

| Variable                     | Where                                             | When it is read                    |
| ---------------------------- | ------------------------------------------------- | ---------------------------------- |
| `VITE_WHATSAPP_NUMBER`       | Settings → **Build** → variables and secrets      | Build time — Vite inlines it into the JS |
| `RESEND_API_KEY`             | Settings → **Variables and Secrets**, encrypted   | Request time, through `env`        |
| `ENQUIRY_TO`, `ENQUIRY_FROM` | Settings → **Variables and Secrets**              | Request time, through `env`        |

Mark `RESEND_API_KEY` as a secret (the encrypt toggle) so it stops being
readable in the dashboard afterwards.

The runtime three take effect the moment they are saved. Changing the WhatsApp
number instead needs a fresh deploy, because the old one is already baked into
the shipped JavaScript.

Once a deploy is green, `https://<name>.<subdomain>.workers.dev/api/enquiry`
answers and the form works.

### The custom domain, with Google Workspace on it

Two things want DNS records, and one of them can break your email if it is done
carelessly. Read this before touching the registrar.

**Point the domain at the Worker.** An apex domain (`nagasushmitha.com`) cannot be a
CNAME, so it needs Cloudflare running DNS: add the site to Cloudflare, then
change the nameservers at your registrar — Google Domains registrations now
live at Squarespace Domains, so it may be either console depending on whether
yours has been migrated. Only a `www` subdomain could stay where it is, on a
CNAME to `<name>.<subdomain>.workers.dev`. Either way the domain is attached
under the Worker's Settings → Domains & Routes.

> **Check the MX records before you flip the nameservers.** Moving DNS to
> Cloudflare moves *all* of it, Google Workspace's mail routing included.
> Cloudflare's onboarding scans your existing zone and usually imports the
> records, but it is a scan, not a guarantee. Compare the imported MX and TXT
> entries against the originals **while the old nameservers are still live**,
> and fix any gaps first. Get this wrong and mail to your domain stops arriving,
> with no error to tell you.

**Verify a sending domain in Resend**, which is what lifts the sandbox: until
you do, Resend delivers only to the address the account was registered with, and
`ENQUIRY_TO` cannot be your Workspace inbox.

Use a **subdomain** — `send.nagasushmitha.com` — not the apex. A domain may
carry only one SPF record, and your apex already has Google Workspace's. Adding
Resend there means editing that record to merge both includes, and a mistake
takes down Workspace's outbound mail. A subdomain gets its own SPF, DKIM and
DMARC, entirely clear of Google's.

Add the records Resend gives you to the Cloudflare zone, leave them
**DNS-only** (grey cloud, not orange — proxying breaks mail records), and once
Resend reports verified:

```
ENQUIRY_FROM=Naga Sushmitha <enquiries@send.nagasushmitha.com>
ENQUIRY_TO=contact@nagasushmitha.com
```

The `from` has to sit on the verified subdomain. The `to` can then be anything,
including the Workspace mailbox — replies to it come from your normal inbox, and
visitors never see the `send.` subdomain.

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
