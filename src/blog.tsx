import React from "react";
import { createRoot } from "react-dom/client";
import BlogPage from "./BlogPage";
import "./styles/fonts.css";
import "./styles/tailwind.css";

/* Sibling of main.tsx and gallery.tsx: same mount, same stylesheets, different
   root component. All three are listed in vite.config.ts, which is what makes
   the built site three documents rather than one. */
const container = document.getElementById("root");
if (!container) {
  throw new Error('Mount point "#root" is missing from blog.html');
}

createRoot(container).render(
  <React.StrictMode>
    <BlogPage />
  </React.StrictMode>,
);
