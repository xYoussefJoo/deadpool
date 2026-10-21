"use client";

import { useEffect, useState } from "react";
import type { NavLink } from "@/domain/entities";

/** Fixed top bar: transparent over the hero, solid once the page scrolls; a full-screen menu on phones. */
export function SiteHeader({ navigation }: { navigation: NavLink[] }) {
  const [solid, setSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header${solid ? " is-solid" : ""}${menuOpen ? " is-open" : ""}`}>
      <a className="site-header__logo display" href="#top" onClick={() => setMenuOpen(false)}>
        Deadpool
      </a>
      <nav aria-label="Main">
        <ul className="site-header__links">
          {navigation.map((link) => (
            <li key={link.href}>
              <a href={link.href} onClick={() => setMenuOpen(false)}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <a className="button site-header__cta" href="#dead-pool">
        Place a bet
      </a>
      <button type="button" className="site-header__toggle" aria-expanded={menuOpen} aria-label="Menu" onClick={() => setMenuOpen((value) => !value)}>
        <span />
        <span />
      </button>
    </header>
  );
}
