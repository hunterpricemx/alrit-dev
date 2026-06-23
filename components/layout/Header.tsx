"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import LocaleSwitcher from "./LocaleSwitcher";

export default function Header({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const base = `/${locale}`;
  const links = [
    { href: `${base}/servicios`, label: dict.nav.services },
    { href: `${base}#calculator`, label: dict.nav.calculator },
    { href: `${base}/portafolio`, label: dict.nav.portfolio },
    { href: `${base}#process`, label: dict.nav.process },
  ];

  return (
    <header className={`header${scrolled ? " header--scrolled" : ""}`}>
      <div className="header__inner">
        <Link href={base} className="header__logo" aria-label="Alrit.dev">
          Alrit<span className="header__logo-dot">.dev</span>
        </Link>

        <nav className="header__nav" aria-label="Main">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="header__link">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="header__actions">
          <LocaleSwitcher locale={locale} />
          <Link href={`${base}#calculator`} className="header__cta">
            {dict.nav.cta}
          </Link>
        </div>
      </div>
    </header>
  );
}
