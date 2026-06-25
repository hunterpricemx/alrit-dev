import { sameAs, type SiteSettings } from "@/lib/content/settings";

type JsonLdProps = { data: Record<string, unknown> };

function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd({ url, settings }: { url: string; settings: SiteSettings }) {
  const areaServed = [
    { "@type": "Country", name: "México" },
    { "@type": "Country", name: "España" },
  ];
  const social = sameAs(settings);
  const address =
    settings.addressLocality || settings.streetAddress
      ? {
          "@type": "PostalAddress",
          ...(settings.streetAddress && { streetAddress: settings.streetAddress }),
          ...(settings.addressLocality && { addressLocality: settings.addressLocality }),
          ...(settings.addressRegion && { addressRegion: settings.addressRegion }),
          ...(settings.postalCode && { postalCode: settings.postalCode }),
          addressCountry: settings.addressCountry || "MX",
        }
      : undefined;

  const org: Record<string, unknown> = {
    "@type": "Organization",
    "@id": `${url}/#organization`,
    name: "Alrit.dev",
    url,
    description: "Estudio mexicano de desarrollo web y software a la medida. La evolución de Hunter Price Mx.",
    logo: { "@type": "ImageObject", "@id": `${url}/#logo`, url: `${url}/icon.svg`, caption: "Alrit.dev" },
    image: `${url}/og.png`,
    knowsLanguage: ["es", "en"],
    areaServed,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      ...(settings.email && { email: settings.email }),
      ...(settings.phone && { telephone: settings.phone }),
      availableLanguage: ["Spanish", "English"],
      areaServed: ["MX", "ES"],
    },
  };
  if (settings.email) org.email = settings.email;
  if (settings.phone) org.telephone = settings.phone;
  if (address) org.address = address;
  if (social.length) org.sameAs = social;

  const local: Record<string, unknown> = {
    "@type": "ProfessionalService",
    "@id": `${url}/#localbusiness`,
    name: "Alrit.dev",
    url,
    image: `${url}/og.png`,
    logo: `${url}/icon.svg`,
    description: "Desarrollo web y software a la medida: sitios, e-commerce, plataformas, sistemas y apps.",
    priceRange: settings.priceRange || "$$",
    areaServed,
    parentOrganization: { "@id": `${url}/#organization` },
  };
  if (settings.phone) local.telephone = settings.phone;
  if (address) local.address = address;
  if (social.length) local.sameAs = social;

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      org,
      local,
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url,
        name: "Alrit.dev",
        publisher: { "@id": `${url}/#organization` },
        inLanguage: ["es-MX", "en-US"],
      },
    ],
  };
  return <JsonLd data={data} />;
}

const SITE_URL = "https://alrit.dev";

export function ServiceJsonLd({
  name,
  description,
  url,
  faq,
}: {
  name: string;
  description: string;
  url: string;
  faq?: { q: string; a: string }[];
}) {
  const graph: Record<string, unknown>[] = [
    {
      "@type": "Service",
      "@id": `${url}#service`,
      name,
      description,
      url,
      provider: { "@id": `${SITE_URL}/#organization` },
      areaServed: [
        { "@type": "Country", name: "México" },
        { "@type": "Country", name: "España" },
      ],
      serviceType: name,
      mainEntityOfPage: url,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      offers: {
        "@type": "Offer",
        url: `${url}#calculator`,
        priceCurrency: "MXN",
        availability: "https://schema.org/InStock",
        seller: { "@id": `${SITE_URL}/#organization` },
      },
    },
  ];
  if (faq && faq.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }
  return <JsonLd data={{ "@context": "https://schema.org", "@graph": graph }} />;
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((it, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: it.name,
          item: it.url,
        })),
      }}
    />
  );
}

export function CaseStudyJsonLd({
  name,
  description,
  url,
  image,
}: {
  name: string;
  description: string;
  url: string;
  image: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name,
        description,
        url,
        image,
        creator: { "@id": `${SITE_URL}/#organization` },
      }}
    />
  );
}

export function BlogPostingJsonLd({
  url,
  headline,
  description,
  image,
  datePublished,
  dateModified,
  author,
  locale,
}: {
  url: string;
  headline: string;
  description: string;
  image?: string;
  datePublished: string | null;
  dateModified: string;
  author: string;
  locale: "es" | "en";
}) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline,
    description,
    datePublished: datePublished ?? dateModified,
    dateModified,
    author: { "@type": "Person", name: author },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntityOfPage: url,
    inLanguage: locale === "en" ? "en-US" : "es-MX",
  };
  if (image) data.image = image;
  return <JsonLd data={data} />;
}
