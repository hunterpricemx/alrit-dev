import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locales, isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n";
import {
  getServiceContent,
  getAllServiceSlugs,
  RELATED_PORTFOLIO,
} from "@/lib/content/services";
import { type ServiceId } from "@/lib/services";
import { getProject } from "@/lib/content/portfolio";
import ServiceLanding from "@/components/services/ServiceLanding";
import {
  ServiceJsonLd,
  BreadcrumbJsonLd,
} from "@/lib/seo/jsonld";

const SITE_URL = "https://alrit.dev";

export function generateStaticParams() {
  const slugs = getAllServiceSlugs();
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const content = getServiceContent(slug);
  if (!isLocale(locale) || !content) return {};
  const c = content[locale as Locale];
  const path = `/${locale}/servicios/${slug}`;
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    keywords: content.targetKeywords,
    alternates: {
      canonical: path,
      languages: {
        es: `/es/servicios/${slug}`,
        en: `/en/servicios/${slug}`,
        "x-default": `/es/servicios/${slug}`,
      },
    },
    openGraph: {
      title: c.metaTitle,
      description: c.metaDescription,
      url: `${SITE_URL}${path}`,
      siteName: "Alrit.dev",
      locale: locale === "en" ? "en_US" : "es_MX",
      type: "website",
    },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const content = getServiceContent(slug);
  if (!isLocale(locale) || !content) notFound();
  const l = locale as Locale;
  const dict = getDictionary(l);
  const c = content[l];

  const serviceTitle = dict.services.items[content.serviceId as ServiceId].title;

  const relatedSlugs = RELATED_PORTFOLIO[content.serviceId] ?? [];
  const related = relatedSlugs
    .map((s) => getProject(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const url = `${SITE_URL}/${locale}/servicios/${slug}`;

  return (
    <>
      <ServiceJsonLd name={serviceTitle} description={c.metaDescription} url={url} faq={c.faq} />
      <BreadcrumbJsonLd
        items={[
          { name: dict.serviceLanding.home, url: `${SITE_URL}/${locale}` },
          { name: dict.serviceLanding.services, url: `${SITE_URL}/${locale}/servicios` },
          { name: serviceTitle, url },
        ]}
      />
      <ServiceLanding
        locale={l}
        dict={dict}
        content={c}
        accent={content.accent}
        serviceTitle={serviceTitle}
        keywords={content.targetKeywords}
        related={related}
      />
    </>
  );
}
