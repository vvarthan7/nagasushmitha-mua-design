import { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import s from "./Nav.module.css";

const LINKS = [
  { href: "#bridal", label: "Bridal" },
  { href: "#courses", label: "Courses" },
  { href: "#gallery", label: "Gallery" },
  { href: "#words", label: "Words" },
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

  return (
    <header className={`${s.nav} ${scrolled ? s.scrolled : ""}`}>
      <div className={s.inner}>
        <a href="#top" className={s.brand}>
          <img src={logo} alt="" className={s.logo} />
          <span className={s.brandName}>Naga Sushmitha</span>
        </a>

        <nav className={`${s.links} ${menuOpen ? s.open : ""}`}>
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className={s.link}>
              {l.label}
            </a>
          ))}
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
