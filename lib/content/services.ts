import data from "./services.data.json";

export type Benefit = { title: string; text: string };
export type Faq = { q: string; a: string };
export type Section = { heading: string; body: string };

export type ServiceLocaleContent = {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  heroSub: string;
  benefits: Benefit[];
  faq: Faq[];
  cta: string;
  sections: Section[];
};

export type ServiceContent = {
  serviceId: string;
  slug: string;
  accent: string;
  schema: string;
  targetKeywords: string[];
  es: ServiceLocaleContent;
  en: ServiceLocaleContent;
};

const SERVICES = data as Record<string, ServiceContent>;

export function getServiceContent(slug: string): ServiceContent | undefined {
  return SERVICES[slug];
}

export function getAllServiceSlugs(): string[] {
  return Object.keys(SERVICES);
}

/** Real portfolio cases shown on each service landing, keyed by serviceId. */
export const RELATED_PORTFOLIO: Record<string, string[]> = {
  webdev: [
    "conquer-classic-plus",
    "conectas-plataforma-experiencias-gastronomicas",
    "programarte-plataforma-bienestar-mental",
  ],
  wordpress: ["rciu-education-red-universidades-wordpress", "bds-motos"],
  lms: ["bodhi-medicine-plataforma-formacion-salud-holistica"],
  realestate: ["bdweb-plataforma-inmobiliaria"],
  ecommerce: ["bds-motos", "conectas-plataforma-experiencias-gastronomicas"],
  systems: [
    "conectas-plataforma-experiencias-gastronomicas",
    "conquer-classic-plus",
  ],
  mobile: [
    "conectas-plataforma-experiencias-gastronomicas",
    "programarte-plataforma-bienestar-mental",
  ],
  automation: [],
  chatbots: ["conectas-plataforma-experiencias-gastronomicas"],
};
