import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { locales, isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n";
import { SERVICES } from "@/lib/services";
import { BreadcrumbJsonLd } from "@/lib/seo/jsonld";

const SITE_URL = "https://alrit.dev";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale as Locale);
  const path = `/${locale}/servicios`;
  return {
    title: `${dict.servicesHub.title} | Alrit.dev`,
    description: dict.servicesHub.subtitle,
    alternates: {
      canonical: path,
      languages: { es: "/es/servicios", en: "/en/servicios", "x-default": "/es/servicios" },
    },
  };
}

export default async function ServicesHub({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l = locale as Locale;
  const dict = getDictionary(l);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: dict.serviceLanding.home, url: `${SITE_URL}/${locale}` },
          { name: dict.serviceLanding.services, url: `${SITE_URL}/${locale}/servicios` },
        ]}
      />
      <section className="hub">
        <header className="hub__head">
          <p className="hub__eyebrow">{dict.servicesHub.eyebrow}</p>
          <h1 className="hub__title">{dict.servicesHub.title}</h1>
          <p className="hub__sub">{dict.servicesHub.subtitle}</p>
        </header>

        <ul className="hub__grid">
          {SERVICES.map((s) => {
            const copy = dict.services.items[s.id];
            return (
              <li key={s.id}>
                <Link
                  href={`/${locale}/servicios/${s.slug}`}
                  className="hub-card"
                  style={{ "--accent": s.accent } as React.CSSProperties}
                >
                  <span className="hub-card__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d={s.icon} />
                    </svg>
                  </span>
                  <h2 className="hub-card__title">{copy.title}</h2>
                  <p className="hub-card__text">{copy.text}</p>
                  <span className="hub-card__cta">
                    {dict.services.cta}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
