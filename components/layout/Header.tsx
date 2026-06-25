"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { useSession } from "next-auth/react";
import { SERVICES, type ServiceId } from "@/lib/services";
import { BLOG_CATEGORIES, categoryLabel } from "@/lib/content/blog-categories";
import { FEATURES } from "@/lib/features";
import LocaleSwitcher from "./LocaleSwitcher";

type MenuKey = "services" | "portfolio" | "blog" | "company";

const WEB_IDS: ServiceId[] = ["wordpress", "webdev", "lms", "ecommerce", "realestate"];
const APP_IDS: ServiceId[] = ["systems", "mobile", "automation"];

type FeaturedItem = { slug: string; name: string; image: string; cat: string };
type LatestPost = { slug: string; title: string; cover: string | null; category: string };

const Chevron = () => (
  <svg className="nav__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export default function Header({ dict, locale, featured, latestPosts }: { dict: Dictionary; locale: Locale; featured: FeaturedItem[]; latestPosts: LatestPost[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<MenuKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSec, setMobileSec] = useState<MenuKey | null>("services");
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const base = `/${locale}`;
  const m = dict.mega;
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const dashHref = role === "CLIENT" ? `${base}/portal` : role === "STUDENT" ? (FEATURES.lms ? `${base}/mi-aprendizaje` : base) : `${base}/cuenta`;
  const dashLabel = role === "CLIENT" ? dict.nav.portal : dict.nav.dashboard;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Lock body scroll when the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const openMenu = (key: MenuKey) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(key);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), 130);
  };

  const cat = (id: string) =>
    dict.portfolio.categories[id as keyof typeof dict.portfolio.categories];

  const serviceCol = (ids: ServiceId[]) =>
    ids.map((id) => {
      const s = SERVICES.find((x) => x.id === id)!;
      const copy = dict.services.items[id];
      return (
        <Link key={id} href={`${base}/servicios/${s.slug}`} className="mega-link" style={{ "--accent": s.accent } as React.CSSProperties}>
          <span className="mega-link__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d={s.icon} />
            </svg>
          </span>
          <span className="mega-link__body">
            <span className="mega-link__name">{copy.title}</span>
            <span className="mega-link__desc">{copy.text}</span>
          </span>
        </Link>
      );
    });

  return (
    <header className={`header${scrolled || open ? " header--scrolled" : ""}`} onMouseLeave={scheduleClose}>
      <div className="header__inner">
        <Link href={base} className="header__logo" aria-label="Alrit.dev" onMouseEnter={() => setOpen(null)} onClick={() => setMobileOpen(false)}>
          Alrit<span className="header__logo-dot">.dev</span>
        </Link>

        {/* Desktop nav */}
        <div className="header__nav">
          <div className="nav__item" onMouseEnter={() => openMenu("services")}>
            <Link href={`${base}/servicios`} className="nav__link" aria-haspopup="true" aria-expanded={open === "services"} onClick={() => setOpen(null)}>
              {dict.nav.services} <Chevron />
            </Link>
          </div>
          <div className="nav__item" onMouseEnter={() => openMenu("portfolio")}>
            <Link href={`${base}/portafolio`} className="nav__link" aria-haspopup="true" aria-expanded={open === "portfolio"} onClick={() => setOpen(null)}>
              {dict.nav.portfolio} <Chevron />
            </Link>
          </div>
          {FEATURES.blog && (
            <div className="nav__item" onMouseEnter={() => openMenu("blog")}>
              <button type="button" className="nav__link" aria-expanded={open === "blog"} aria-haspopup="true" onClick={() => setOpen(open === "blog" ? null : "blog")}>
                {dict.nav.blog} <Chevron />
              </button>
            </div>
          )}
          <div className="nav__item" onMouseEnter={() => openMenu("company")}>
            <button type="button" className="nav__link" aria-expanded={open === "company"} aria-haspopup="true" onClick={() => setOpen(open === "company" ? null : "company")}>
              {dict.nav.company} <Chevron />
            </button>
          </div>
          {FEATURES.lms && (
            <Link href={`${base}/cursos`} className="nav__link nav__link--plain" onMouseEnter={() => setOpen(null)}>
              {dict.nav.courses}
            </Link>
          )}
          <Link href={`${base}#calculator`} className="nav__link nav__link--plain" onMouseEnter={() => setOpen(null)}>
            {dict.nav.calculator}
          </Link>

          {/* Mega panel */}
          <div className={`mega-wrap${open ? " is-open" : ""}`} onMouseEnter={() => closeTimer.current && clearTimeout(closeTimer.current)} onMouseLeave={scheduleClose} onClick={() => setOpen(null)}>
            {open === "services" && (
              <div className="mega mega--services">
                <div className="mega__col">
                  <p className="mega__group">{m.groupWeb}</p>
                  {serviceCol(WEB_IDS)}
                </div>
                <div className="mega__col">
                  <p className="mega__group">{m.groupApps}</p>
                  {serviceCol(APP_IDS)}
                  <Link href={`${base}/servicios`} className="mega__all">
                    {m.allServices}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </Link>
                </div>
                <Link href={`${base}#calculator`} className="mega-cta">
                  <span className="mega-cta__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 7h6M9 11h6M9 15h4M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" /></svg>
                  </span>
                  <span className="mega-cta__title">{m.ctaTitle}</span>
                  <span className="mega-cta__text">{m.ctaText}</span>
                  <span className="mega-cta__link">{m.ctaLink} →</span>
                </Link>
              </div>
            )}

            {open === "portfolio" && (
              <div className="mega mega--portfolio">
                <p className="mega__group">{m.featured}</p>
                <div className="mega__cases">
                  {featured.map((p) => (
                    <Link key={p.slug} href={`${base}/portafolio/${p.slug}`} className="mega-case">
                      <span className="mega-case__media">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.image} alt={p.name} loading="lazy" />
                      </span>
                      <span className="mega-case__cat">{cat(p.cat)}</span>
                      <span className="mega-case__name">{p.name}</span>
                    </Link>
                  ))}
                </div>
                <Link href={`${base}/portafolio`} className="mega__all">
                  {m.allProjects}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </Link>
              </div>
            )}

            {FEATURES.blog && open === "blog" && (
              <div className="mega mega--portfolio">
                <p className="mega__group">{dict.nav.blog}</p>
                <div className="mega__cases">
                  {latestPosts.map((p) => (
                    <Link key={p.slug} href={`${base}/blog/${p.slug}`} className="mega-case">
                      {p.cover && (
                        <span className="mega-case__media">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.cover} alt={p.title} loading="lazy" />
                        </span>
                      )}
                      <span className="mega-case__cat">{categoryLabel(p.category, locale)}</span>
                      <span className="mega-case__name">{p.title}</span>
                    </Link>
                  ))}
                </div>
                <div className="mega__col">
                  {BLOG_CATEGORIES.map((c) => (
                    <Link key={c.key} href={`${base}/blog?cat=${c.key}`} className="mega-link">
                      <span className="mega-link__body"><span className="mega-link__name">{c[locale]}</span></span>
                    </Link>
                  ))}
                  <Link href={`${base}/blog`} className="mega__all">
                    {m.allProjects}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </Link>
                </div>
              </div>
            )}

            {open === "company" && (
              <div className="mega mega--company">
                <span className="mega-link mega-link--soon">
                  <span className="mega-link__body">
                    <span className="mega-link__name">{dict.footer.company.about} <em className="mega-tag">{m.soon}</em></span>
                    <span className="mega-link__desc">{m.aboutDesc}</span>
                  </span>
                </span>
                <Link href={`${base}#process`} className="mega-link">
                  <span className="mega-link__body">
                    <span className="mega-link__name">{dict.nav.process}</span>
                    <span className="mega-link__desc">{m.processDesc}</span>
                  </span>
                </Link>
                <span className="mega-link mega-link--soon">
                  <span className="mega-link__body">
                    <span className="mega-link__name">{dict.footer.columns.contact} <em className="mega-tag">{m.soon}</em></span>
                    <span className="mega-link__desc">{m.contactDesc}</span>
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="header__actions" onMouseEnter={() => setOpen(null)}>
          <LocaleSwitcher locale={locale} />
          <Link href={session ? dashHref : `${base}/ingresar`} className="header__login">
            {session ? dashLabel : dict.nav.login}
          </Link>
          <Link href={`${base}#calculator`} className="header__cta">
            {dict.nav.cta}
          </Link>
          <button
            type="button"
            className={`header__burger${mobileOpen ? " is-open" : ""}`}
            aria-label="Menú"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={`drawer${mobileOpen ? " is-open" : ""}`} aria-hidden={!mobileOpen}>
        <nav className="drawer__nav">
          <button type="button" className="drawer__sec" aria-expanded={mobileSec === "services"} onClick={() => setMobileSec(mobileSec === "services" ? null : "services")}>
            {dict.nav.services} <Chevron />
          </button>
          {mobileSec === "services" && (
            <div className="drawer__panel">
              {[...WEB_IDS, ...APP_IDS].map((id) => {
                const s = SERVICES.find((x) => x.id === id)!;
                return (
                  <Link key={id} href={`${base}/servicios/${s.slug}`} className="drawer__link" onClick={() => setMobileOpen(false)}>
                    {dict.services.items[id].title}
                  </Link>
                );
              })}
              <Link href={`${base}/servicios`} className="drawer__link drawer__link--all" onClick={() => setMobileOpen(false)}>{m.allServices}</Link>
            </div>
          )}

          <Link href={`${base}/portafolio`} className="drawer__sec" onClick={() => setMobileOpen(false)}>{dict.nav.portfolio}</Link>
          {FEATURES.lms && <Link href={`${base}/cursos`} className="drawer__sec" onClick={() => setMobileOpen(false)}>{dict.nav.courses}</Link>}
          {FEATURES.blog && <Link href={`${base}/blog`} className="drawer__sec" onClick={() => setMobileOpen(false)}>{dict.nav.blog}</Link>}
          <Link href={`${base}#calculator`} className="drawer__sec" onClick={() => setMobileOpen(false)}>{dict.nav.calculator}</Link>
          <Link href={session ? dashHref : `${base}/ingresar`} className="drawer__sec" onClick={() => setMobileOpen(false)}>
            {session ? dashLabel : dict.nav.login}
          </Link>

          <Link href={`${base}#calculator`} className="drawer__cta" onClick={() => setMobileOpen(false)}>{dict.nav.cta}</Link>
        </nav>
      </div>
    </header>
  );
}
