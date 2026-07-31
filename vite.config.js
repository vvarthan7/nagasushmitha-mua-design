import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // Relative base so the built site works from a subpath (e.g. GitHub Pages).
  base: "./",

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
