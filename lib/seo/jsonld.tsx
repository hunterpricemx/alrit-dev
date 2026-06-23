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
