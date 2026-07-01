import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locales, isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionaryAsync } from "@/lib/i18n";
import { getSettingsAsync, whatsappHref } from "@/lib/content/settings";
import { BreadcrumbJsonLd } from "@/lib/seo/jsonld";
import ContactForm from "@/components/sections/ContactForm";

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
  const c = dict.contacto;
  const path = `/${locale}/contacto`;
  return {
    title: { absolute: c.metaTitle },
    description: c.metaDescription,
    alternates: {
      canonical: path,
      languages: { es: "/es/contacto", en: "/en/contacto", "x-default": "/es/contacto" },
    },
    openGraph: {
      title: c.metaTitle,
      description: c.metaDescription,
      url: `${SITE_URL}${path}`,
      siteName: "Alrit.dev",
      locale: locale === "en" ? "en_US" : "es_MX",
      type: "website",
      images: ["/og.png"],
    },
    twitter: { card: "summary_large_image", title: c.metaTitle, description: c.metaDescription, images: ["/og.png"] },
  };
}

export default async function ContactoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l = locale as Locale;
  const dict = await getDictionaryAsync(l);
  const c = dict.contacto;
  const settings = await getSettingsAsync();
  const wa = whatsappHref(settings);
  const address = [settings.streetAddress, settings.addressLocality, settings.addressRegion, settings.postalCode]
    .filter(Boolean)
    .join(", ");

  const linkCls = "underline decoration-stone-300 underline-offset-4 hover:decoration-stone-900";

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: dict.serviceLanding.home, url: `${SITE_URL}/${locale}` },
          { name: c.eyebrow, url: `${SITE_URL}/${locale}/contacto` },
        ]}
      />
      <section className="mx-auto max-w-5xl px-6 py-16 md:py-24">
        <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">{c.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-stone-900 md:text-5xl">{c.title}</h1>
        <p className="mt-5 max-w-2xl text-lg text-stone-600">{c.lede}</p>

        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <ContactForm
            labels={{
              name: c.formName,
              email: c.formEmail,
              phone: c.formPhone,
              message: c.formMessage,
              submit: c.formSubmit,
              sending: c.formSending,
              ok: c.formOk,
              error: c.formError,
            }}
          />

          <div>
            <h2 className="font-bold text-stone-900">{c.directTitle}</h2>
            <ul className="mt-4 grid gap-3 text-stone-700">
              {wa && (
                <li>
                  <a href={wa} target="_blank" rel="noopener noreferrer" className={`font-semibold text-stone-900 ${linkCls}`}>
                    {c.labelWhatsapp}
                  </a>
                </li>
              )}
              {settings.email && (
                <li>
                  <span className="text-stone-500">{c.labelEmail}: </span>
                  <a href={`mailto:${settings.email}`} className={linkCls}>
                    {settings.email}
                  </a>
                </li>
              )}
              {settings.phone && (
                <li>
                  <span className="text-stone-500">{c.labelPhone}: </span>
                  <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className={linkCls}>
                    {settings.phone}
                  </a>
                </li>
              )}
              {address && (
                <li>
                  <span className="text-stone-500">{c.labelAddress}: </span>
                  {address}
                </li>
              )}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
