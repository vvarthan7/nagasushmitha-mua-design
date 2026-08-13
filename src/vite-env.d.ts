/// <reference types="vite/client" />

import "react";

/* React's CSSProperties has no slot for CSS custom properties, and several
   components hand values to CSS that way rather than setting the property
   directly — `--hero-h` on the banner, `--dir` and `--veil` on the coverflow.
   The key pattern keeps the hole narrow: only `--*` names are let through, so a
   typo in a real property is still caught. */
declare module "react" {
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}
