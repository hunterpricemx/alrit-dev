import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locales, isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n";
import { getProject, getAllProjectSlugs } from "@/lib/content/portfolio";
import { getServiceContent } from "@/lib/content/services";
import { type ServiceId } from "@/lib/services";
import CaseStudy from "@/components/portfolio/CaseStudy";
import { CaseStudyJsonLd, BreadcrumbJsonLd } from "@/lib/seo/jsonld";

const SITE_URL = "https://alrit.dev";

export const revalidate = 3600;

export function generateStaticParams() {
  const slugs = getAllProjectSlugs();
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = getProject(slug);
  if (!isLocale(locale) || !project) return {};
  const p = project[locale as Locale];
  const path = `/${locale}/portafolio/${slug}`;
  return {
    title: `${p.title} | Portafolio Alrit.dev`,
    description: p.short,
    alternates: {
      canonical: path,
      languages: {
        es: `/es/portafolio/${slug}`,
        en: `/en/portafolio/${slug}`,
        "x-default": `/es/portafolio/${slug}`,
      },
    },
    openGraph: {
      title: p.title,
      description: p.short,
      url: `${SITE_URL}${path}`,
      images: [{ url: project.image }],
      type: "article",
    },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const project = getProject(slug);
  if (!isLocale(locale) || !project) notFound();
  const l = locale as Locale;
  const dict = getDictionary(l);
  const p = project[l];

  const categoryLabel =
    dict.portfolio.categories[project.cat as keyof typeof dict.portfolio.categories];
  const relatedContent = getServiceContent(project.relatedService);
  const relatedServiceTitle = relatedContent
    ? dict.services.items[relatedContent.serviceId as ServiceId].title
    : dict.serviceLanding.services;

  const url = `${SITE_URL}/${locale}/portafolio/${slug}`;

  return (
    <>
      <CaseStudyJsonLd name={p.title} description={p.short} url={url} image={`${SITE_URL}${project.image}`} />
      <BreadcrumbJsonLd
        items={[
          { name: dict.caseStudy.home, url: `${SITE_URL}/${locale}` },
          { name: dict.caseStudy.portfolio, url: `${SITE_URL}/${locale}/portafolio` },
          { name: p.title, url },
        ]}
      />
      <CaseStudy
        locale={l}
        dict={dict}
        project={project}
        categoryLabel={categoryLabel}
        relatedServiceTitle={relatedServiceTitle}
      />
    </>
  );
}
