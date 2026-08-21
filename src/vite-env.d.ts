/// <reference types="vite/client" />

import "react";

/* React's CSSProperties has no slot for CSS custom properties, and several
   components hand values to CSS that way rather than setting the property
   directly — `--hero-h` on the banner, `--dir` and `--veil` on GalleryStrip.
   The key pattern keeps the hole narrow: only `--*` names are let through, so a
   typo in a real property is still caught. */
declare module "react" {
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}

/* Only VITE_-prefixed names reach the browser, and everything that does is
   public — it is inlined into the bundle at build time. Server-only secrets
   (RESEND_API_KEY, ENQUIRY_TO) are deliberately absent from this list: they
   reach functions/api/enquiry.ts through Cloudflare's env binding, never renamed
   into this namespace. */
declare global {
  interface ImportMetaEnv {
    /** WhatsApp number in international format. Non-digits are stripped in
     *  data.ts, so "+91 93807 58632" and "919380758632" are both accepted. */
    readonly VITE_WHATSAPP_NUMBER: string;
  }
}
