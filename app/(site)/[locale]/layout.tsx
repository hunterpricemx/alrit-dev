import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import "../../globals.css";
import { locales, isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionaryAsync } from "@/lib/i18n";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
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
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: {
      canonical: `/${locale}`,
      languages: { es: "/es", en: "/en" },
    },
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      url: `${SITE_URL}/${locale}`,
      siteName: "Alrit.dev",
      locale: locale === "en" ? "en_US" : "es_MX",
      type: "website",
    },
    twitter: { card: "summary_large_image", title: dict.meta.title, description: dict.meta.description },
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

  return (
    <html
      lang={locale}
      className={`${poppins.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <OrganizationJsonLd url={SITE_URL} />
        <Header dict={dict} locale={locale as Locale} />
        <main className="flex-1">{children}</main>
        <Footer dict={dict} locale={locale as Locale} />
      </body>
    </html>
  );
}
