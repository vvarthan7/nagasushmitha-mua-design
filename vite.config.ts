import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  // Relative base so the built site works from a subpath (e.g. GitHub Pages).
  base: "./",

  build: {
    // Two documents, not one bundle with a router. Every .html listed here
    // becomes an entry, and because `base` is relative both land wherever the
    // site is served from — /gallery.html locally, /<repo>/gallery.html on
    // Pages — with no SPA fallback or 404.html redirect needed to make deep
    // links work. Adding a page means a file here and an .html beside
    // index.html; anything the two share is split into a common chunk.
    rollupOptions: {
      input: {
        main: "index.html",
        gallery: "gallery.html",
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
