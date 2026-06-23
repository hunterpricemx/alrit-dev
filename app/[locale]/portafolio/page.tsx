import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { locales, isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n";
import { getAllProjects } from "@/lib/content/portfolio";
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
  const path = `/${locale}/portafolio`;
  return {
    title: `${dict.portfolio.title} | Alrit.dev`,
    description: dict.portfolio.text,
    alternates: {
      canonical: path,
      languages: { es: "/es/portafolio", en: "/en/portafolio", "x-default": "/es/portafolio" },
    },
  };
}

export default async function PortfolioHub({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l = locale as Locale;
  const dict = getDictionary(l);
  const projects = getAllProjects();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: dict.caseStudy.home, url: `${SITE_URL}/${locale}` },
          { name: dict.portfolio.title, url: `${SITE_URL}/${locale}/portafolio` },
        ]}
      />
      <section className="hub">
        <header className="hub__head">
          <p className="hub__eyebrow">{dict.portfolio.eyebrow}</p>
          <h1 className="hub__title">{dict.portfolio.title}</h1>
          <p className="hub__sub">{dict.portfolio.text}</p>
        </header>

        <ul className="pf-grid">
          {projects.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/${locale}/portafolio/${p.slug}`}
                className="pf-card"
                style={{ "--bg": p.bg } as React.CSSProperties}
              >
                <span className="pf-card__media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p[l].title} loading="lazy" />
                </span>
                <span className="pf-card__cat">
                  {dict.portfolio.categories[p.cat as keyof typeof dict.portfolio.categories]}
                </span>
                <span className="pf-card__name">{p[l].title}</span>
                <span className="pf-card__desc">{p[l].short}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
