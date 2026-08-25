/**
 * The page nsmakeupartistry.com serves until launch day.
 *
 * The domain is live — it resolves, it has a certificate, it is on business
 * cards and in Instagram bios — but the site behind it is not meant to be seen
 * yet. Serving nothing would be worse than serving something: a Cloudflare
 * error page reads as "this business is broken" to anyone who visits early,
 * and to any crawler that arrives before launch.
 *
 * So: one small page, no build step, no assets. It is a template literal rather
 * than a file in dist/ on purpose — dist/ is the site, and the whole point of
 * this page is to be reachable when the site is not.
 *
 * Colours and type are lifted from DESIGN_SYSTEM.md so the holding page and the
 * real one look related, but the fonts are system fallbacks: the real faces are
 * self-hosted under hashed filenames that change every build, and a holding
 * page that breaks when the site rebuilds would defeat its own purpose.
 */

interface HoldingLinks {
  instagram: string;
  instagramHandle: string;
  email: string;
  whatsapp?: string;
}

export function holdingPage(links: HoldingLinks): Response {
  const { instagram, instagramHandle, email, whatsapp } = links;

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Naga Sushmitha — Bridal Makeup Artist, Bangalore</title>
<meta name="description" content="Bridal makeup, hair and saree draping in Bangalore. The new site is on its way.">
<!-- Pre-launch: keep this page out of search results entirely, so the holding
     page never becomes the result people find after the site is live. -->
<meta name="robots" content="noindex, nofollow">
<style>
  :root {
    --ink: #2c1a1c;
    --plum: #7d3646;
    --rust: #b0543f;
    --clay: #d99a86;
    --blush: #f5e2d9;
    --blush-soft: #fbeee8;
    --text: #6b4a48;
    --meta: #a98a83;
    --border: #e6bfb2;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 32px 24px;
    background: linear-gradient(170deg, var(--blush-soft) 0%, var(--blush) 100%);
    color: var(--text);
    font-family: Manrope, system-ui, -apple-system, "Segoe UI", sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  main { max-width: 34rem; text-align: center; }
  .eyebrow {
    margin: 0 0 20px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--rust);
  }
  h1 {
    margin: 0 0 18px;
    font-family: "Playfair Display", Georgia, serif;
    font-weight: 400;
    font-size: clamp(34px, 7vw, 58px);
    line-height: 1.08;
    letter-spacing: -0.01em;
    color: var(--ink);
  }
  .rule {
    width: 54px;
    height: 1px;
    margin: 0 auto 22px;
    background: var(--clay);
  }
  p { margin: 0 auto 28px; font-size: 16px; line-height: 1.7; max-width: 26rem; }
  .links {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
  }
  a.btn {
    display: inline-block;
    padding: 11px 20px;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.6);
    color: var(--plum);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.02em;
    text-decoration: none;
    transition: background 0.2s ease, border-color 0.2s ease;
  }
  a.btn:hover { background: #fff; border-color: var(--plum); }
  .meta { margin: 32px 0 0; font-size: 12px; color: var(--meta); letter-spacing: 0.04em; }
  @media (prefers-reduced-motion: no-preference) {
    main { animation: rise 0.6s ease-out both; }
    @keyframes rise {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: none; }
    }
  }
</style>
</head>
<body>
<main>
  <p class="eyebrow">Bridal Makeup Artist &middot; Bangalore</p>
  <h1>Naga Sushmitha</h1>
  <div class="rule"></div>
  <p>A new home for the studio is on its way. Until then, bookings and enquiries are open as usual.</p>
  <div class="links">
    ${whatsapp ? `<a class="btn" href="${whatsapp}">WhatsApp</a>` : ""}
    <a class="btn" href="${instagram}">Instagram ${instagramHandle}</a>
    <a class="btn" href="mailto:${email}">${email}</a>
  </div>
  <p class="meta">Opening soon</p>
</main>
</body>
</html>`;

  return new Response(html, {
    /* 503, not 200. It is the honest status for "this exists but is not being
       served yet", and it is the one status that tells a crawler to come back
       rather than to record what it found. Retry-After keeps that polite. */
    status: 503,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "retry-after": "86400",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}
