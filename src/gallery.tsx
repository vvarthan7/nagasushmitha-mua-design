import React from "react";
import { createRoot } from "react-dom/client";
import GalleryPage from "./GalleryPage";
import "./styles/fonts.css";
import "./styles/tailwind.css";

/* Sibling of main.tsx: same mount, same stylesheets, different root component.
   Both are listed in vite.config.ts, which is what makes the built site two
   documents rather than one. */
const container = document.getElementById("root");
if (!container) {
  throw new Error('Mount point "#root" is missing from gallery.html');
}

createRoot(container).render(
  <React.StrictMode>
    <GalleryPage />
  </React.StrictMode>,
);
