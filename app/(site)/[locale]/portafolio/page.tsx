import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { locales, isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionaryAsync } from "@/lib/i18n";
import { getAllProjectsAsync } from "@/lib/content/portfolio";
import { BreadcrumbJsonLd } from "@/lib/seo/jsonld";

const SITE_URL = "https://alrit.dev";

export const revalidate = 3600;

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
  const dict = await getDictionaryAsync(locale as Locale);
  const path = `/${locale}/portafolio`;
  const title = locale === "en" ? "Portfolio: custom web & software projects" : "Portafolio: proyectos web y software a medida";
  return {
    title,
    description: dict.portfolio.text,
    alternates: {
      canonical: path,
      languages: { es: "/es/portafolio", en: "/en/portafolio", "x-default": "/es/portafolio" },
    },
    openGraph: {
      title: `${title} | Alrit.dev`,
      description: dict.portfolio.text,
      url: `${SITE_URL}${path}`,
      siteName: "Alrit.dev",
      locale: locale === "en" ? "en_US" : "es_MX",
      type: "website",
      images: ["/og.png"],
    },
    twitter: { card: "summary_large_image", title: `${title} | Alrit.dev`, description: dict.portfolio.text, images: ["/og.png"] },
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
  const dict = await getDictionaryAsync(l);
  const projects = await getAllProjectsAsync();

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

        <h2 className="sr-only">{l === "en" ? "Featured projects" : "Proyectos destacados"}</h2>
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
                <span className="pf-card__name">{p[l].name || p[l].title}</span>
                <span className="pf-card__desc">{p[l].short}</span>
                <span className="pf-card__cta">
                  {dict.portfolio.seeMore}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
