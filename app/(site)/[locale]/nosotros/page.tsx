import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { locales, isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionaryAsync } from "@/lib/i18n";
import { BreadcrumbJsonLd } from "@/lib/seo/jsonld";
import Reveal from "@/components/ui/Reveal";

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
  const n = dict.nosotros;
  const path = `/${locale}/nosotros`;
  return {
    title: { absolute: n.metaTitle },
    description: n.metaDescription,
    alternates: {
      canonical: path,
      languages: { es: "/es/nosotros", en: "/en/nosotros", "x-default": "/es/nosotros" },
    },
    openGraph: {
      title: n.metaTitle,
      description: n.metaDescription,
      url: `${SITE_URL}${path}`,
      siteName: "Alrit.dev",
      locale: locale === "en" ? "en_US" : "es_MX",
      type: "website",
      images: ["/og.png"],
    },
    twitter: { card: "summary_large_image", title: n.metaTitle, description: n.metaDescription, images: ["/og.png"] },
  };
}

export default async function NosotrosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l = locale as Locale;
  const dict = await getDictionaryAsync(l);
  const n = dict.nosotros;
  const base = `/${locale}`;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: dict.serviceLanding.home, url: `${SITE_URL}/${locale}` },
          { name: n.eyebrow, url: `${SITE_URL}${base}/nosotros` },
        ]}
      />
      <section className="mx-auto max-w-5xl px-6 py-16 md:py-24">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">{n.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-stone-900 md:text-5xl">{n.title}</h1>
          <p className="mt-5 max-w-2xl text-lg text-stone-600">{n.lede}</p>
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {dict.servicesX.stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-stone-200 bg-white p-6">
              <div className="text-3xl font-extrabold text-stone-900">{s.value}</div>
              <div className="mt-1 font-semibold text-stone-800">{s.label}</div>
              <div className="text-sm text-stone-500">{s.caption}</div>
            </div>
          ))}
        </div>

        <div className="mt-12 grid max-w-3xl gap-5">
          {n.body.map((p, i) => (
            <p key={i} className="text-lg leading-relaxed text-stone-700">
              {p}
            </p>
          ))}
        </div>

        <h2 className="mt-16 text-2xl font-bold text-stone-900">{n.valuesTitle}</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {n.values.map((v) => (
            <div key={v.title} className="rounded-2xl border border-stone-200 bg-white p-6">
              <h3 className="font-bold text-stone-900">{v.title}</h3>
              <p className="mt-2 text-stone-600">{v.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-3xl bg-stone-900 px-8 py-12 text-center text-white">
          <h2 className="text-2xl font-bold md:text-3xl">{n.ctaTitle}</h2>
          <p className="mx-auto mt-3 max-w-xl text-stone-300">{n.ctaText}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href={`${base}#calculator`} className="rounded-xl bg-white px-6 py-3 font-semibold text-stone-900 transition hover:bg-stone-100">
              {n.ctaPrimary}
            </Link>
            <Link href={`${base}/contacto`} className="rounded-xl border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10">
              {n.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
