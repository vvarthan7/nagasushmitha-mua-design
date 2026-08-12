import { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import s from "./Nav.module.css";

/* An entry with no `href` is listed but not yet live — it renders as a span
   rather than an anchor, so there is nothing to click, tab to, or middle-click
   into a new tab. Give Blog its href once the page exists and it becomes a
   normal link with no other change here. */
const LINKS = [
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#gallery", label: "Gallery" },
  { label: "Blog" },
];

export default function Nav({ scrolled }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // The dropdown only exists below 860px; a resize past that point would
  // otherwise leave it flagged open underneath the desktop bar.
  useEffect(() => {
    const onResize = () => setMenuOpen(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // The bar floats over the banner, so it only takes a background once there is
  // page behind it to hide — or once the mobile dropdown needs one to sit on.
  const solid = scrolled || menuOpen;

  return (
    <header className={`${s.nav} ${solid ? s.solid : ""}`}>
      <div className={s.inner}>
        <a href="#top" className={s.brand}>
          <img src={logo} alt="" className={s.logo} />
          {/* <span className={s.brandName}>NS Makeup Artistry</span> */}
        </a>

        <nav className={`${s.links} ${menuOpen ? s.open : ""}`}>
          {LINKS.map((l) =>
            l.href ? (
              <a key={l.label} href={l.href} className={s.link}>
                {l.label}
              </a>
            ) : (
              <span key={l.label} className={s.link}>
                {l.label}
              </span>
            ),
          )}
          <a href="#enquire" className={s.enquire}>
            Enquire
          </a>
        </nav>

        <button
          type="button"
          className={s.burger}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className={s.burgerLabel}>{menuOpen ? "Close" : "Menu"}</span>
        </button>
      </div>
    </header>
  );
}
