import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  // Relative base so the built site works from a subpath (e.g. GitHub Pages).
  base: "./",

  build: {
    // Three documents, not one bundle with a router. Every .html listed here
    // becomes an entry, and because `base` is relative they all land wherever
    // the site is served from — /gallery.html locally, /<repo>/gallery.html on
    // Pages — with no SPA fallback or 404.html redirect needed to make deep
    // links work. Adding a page means a file here and an .html beside
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
});
