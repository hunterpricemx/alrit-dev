import { Fragment } from "react";

type JsonLdProps = { data: Record<string, unknown> };

function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd({ url }: { url: string }) {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}/#organization`,
        name: "Alrit.dev",
        url,
        description:
          "Estudio de desarrollo web. La evolución de Hunter Price Mx.",
        sameAs: [] as string[],
      },
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
  return (
    <Fragment>
      <JsonLd data={data} />
    </Fragment>
  );
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
      name,
      description,
      url,
      provider: { "@id": `${SITE_URL}/#organization` },
      areaServed: [
        { "@type": "Country", name: "México" },
        { "@type": "Country", name: "España" },
      ],
      serviceType: name,
    },
  ];
  if (faq && faq.length) {
    graph.push({
      "@type": "FAQPage",
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
