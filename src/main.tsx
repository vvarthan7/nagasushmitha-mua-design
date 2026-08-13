import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/fonts.css";
import "./styles/tailwind.css";

/* index.html ships the mount point, so this only fails if the two fall out of
   step — which is worth hearing about rather than papering over. */
const container = document.getElementById("root");
if (!container) {
  throw new Error('Mount point "#root" is missing from index.html');
}

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
