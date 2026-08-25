import React, { type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles/fonts.css";
import "./styles/tailwind.css";

function mount(id: string, tree: ReactNode): void {
  const container = document.getElementById(id);
  if (!container) {
    throw new Error(`Mount point "#${id}" is missing from index.html`);
  }

  createRoot(container).render(<React.StrictMode>{tree}</React.StrictMode>);
}

mount("root", <App />);
