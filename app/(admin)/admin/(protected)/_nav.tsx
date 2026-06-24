"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ICONS = {
  dashboard: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  pricing: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  media: "M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM8 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM21 15l-5-5L5 21",
  portfolio: "M4 7h16v13H4zM9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2",
  text: "M4 7V5h16v2M9 5v14M7 19h4",
};

const NAV = [
  { href: "/admin", label: "Dashboard", icon: ICONS.dashboard, ready: true },
  { href: "/admin/pricing", label: "Precios", icon: ICONS.pricing, ready: true },
  { href: "/admin/media", label: "Medios", icon: ICONS.media, ready: false },
  { href: "/admin/portfolio", label: "Portafolio", icon: ICONS.portfolio, ready: false },
  { href: "/admin/text", label: "Textos", icon: ICONS.text, ready: false },
];

function NavIcon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav>
      <p className="adm__navlabel">Contenido</p>
      {NAV.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        if (!item.ready) {
          return (
            <span key={item.href} className="adm__link" style={{ opacity: 0.4, cursor: "default" }}>
              <NavIcon d={item.icon} /> {item.label}
              <span style={{ marginLeft: "auto", fontSize: "0.62rem", letterSpacing: "0.04em", textTransform: "uppercase", opacity: 0.8 }}>Pronto</span>
            </span>
          );
        }
        return (
          <Link key={item.href} href={item.href} className={`adm__link${active ? " adm__link--active" : ""}`}>
            <NavIcon d={item.icon} /> {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
