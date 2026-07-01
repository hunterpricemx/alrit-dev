import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import "../../globals.css";
import { locales, isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionaryAsync } from "@/lib/i18n";
import { getAllProjectsAsync } from "@/lib/content/portfolio";
import { getLatestPostsAsync, postLocale } from "@/lib/content/blog";
import { getSettingsAsync } from "@/lib/content/settings";
import { FEATURES } from "@/lib/features";
import Header from "@/components/layout/Header";
import PromoBanner from "@/components/layout/PromoBanner";
import Footer from "@/components/layout/Footer";
import Providers from "@/components/Providers";
import SiteAnalytics from "@/components/analytics/SiteAnalytics";
import ConsentBanner from "@/components/analytics/ConsentBanner";
import { OrganizationJsonLd } from "@/lib/seo/jsonld";

const poppins = Poppins({
  variable: "--font-display",
  weight: ["600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

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
  const dict = await getDictionaryAsync(isLocale(locale) ? locale : "es");
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: dict.meta.title, template: "%s | Alrit.dev" },
    description: dict.meta.description,
    alternates: {
      canonical: `/${locale}`,
      languages: { es: "/es", en: "/en", "x-default": "/es" },
    },
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      url: `${SITE_URL}/${locale}`,
      siteName: "Alrit.dev",
      locale: locale === "en" ? "en_US" : "es_MX",
      type: "website",
      images: ["/og.png"],
    },
    twitter: { card: "summary_large_image", title: dict.meta.title, description: dict.meta.description, images: ["/og.png"] },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionaryAsync(locale as Locale);
  const projects = await getAllProjectsAsync();
  const toFeatured = (p: (typeof projects)[number]) => ({
    slug: p.slug,
    name: p[locale as Locale].name || p[locale as Locale].title,
    image: p.image,
    cat: p.cat,
  });
  const picked = projects.filter((p) => p.featured).slice(0, 4);
  const featured = (picked.length ? picked : projects.slice(0, 4)).map(toFeatured);

  const settings = await getSettingsAsync();
  const gaId = settings.gaId || process.env.NEXT_PUBLIC_GA_ID || "";
  const latest = FEATURES.blog ? await getLatestPostsAsync(3) : [];
  const latestPosts = latest.map((p) => ({
    slug: p.slug,
    title: postLocale(p, locale as Locale).title,
    cover: p.cover,
    category: p.category,
  }));

  return (
    <html
      lang={locale}
      className={`${poppins.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <OrganizationJsonLd url={SITE_URL} settings={settings} />
        <Providers>
          <PromoBanner dict={dict} />
          <Header dict={dict} locale={locale as Locale} featured={featured} latestPosts={latestPosts} />
          <main className="flex-1">{children}</main>
          <Footer dict={dict} locale={locale as Locale} settings={settings} />
          <ConsentBanner enabled={!!gaId} />
        </Providers>
        <SiteAnalytics gaId={gaId} />
      </body>
    </html>
  );
}
