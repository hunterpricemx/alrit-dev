import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import Reveal from "@/components/ui/Reveal";

type Cat = "webdev" | "realestate" | "lms";

type Bento = {
  slug: string;
  area: "a" | "b" | "c" | "d" | "e";
  accent: string;
  icon: string;
  image: string;
  name: string;
  nameAccent?: string;
  cat: Cat;
  featured?: boolean;
  desc: { es: string; en: string };
  features?: { es: string[]; en: string[] };
  stack: string[];
};

const ICONS = {
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  house: "M4 11 12 4l8 7M6 10v9h12v-9M10 19v-5h4v5",
  cap: "M3 7l9-4 9 4-9 4-9-4Zm3 2v5c0 1.7 2.7 3 6 3s6-1.3 6-3V9",
  gamepad: "M6 12h4m-2-2v4M15 11h.01M18 13h.01M17.3 5H6.7a4 4 0 0 0-3.98 3.59L2 14a3 3 0 0 0 5.4 2.1L8 15h8l.6 1.1A3 3 0 0 0 22 14l-.72-5.41A4 4 0 0 0 17.3 5Z",
  leaf: "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.52-4.48 10-10 10ZM2 21c0-3 1.85-5.36 5.08-6",
};

const BENTO: Bento[] = [
  {
    slug: "conectas-plataforma-experiencias-gastronomicas",
    area: "a",
    accent: "#e84393",
    icon: ICONS.users,
    image: "/portfolio/conectas.png",
    name: "Conectas",
    nameAccent: ".ai",
    cat: "webdev",
    featured: true,
    desc: {
      es: "Marketplace que conecta marcas con influencers en experiencias gastronómicas únicas.",
      en: "A marketplace connecting brands with influencers through unique gastronomic experiences.",
    },
    features: {
      es: ["Sistema de reservas y pagos", "Matching inteligente", "Dashboard de métricas"],
      en: ["Booking and payment system", "Smart matching", "Metrics dashboard"],
    },
    stack: ["Next.js", "Supabase", "Stripe"],
  },
  {
    slug: "bdweb-plataforma-inmobiliaria",
    area: "b",
    accent: "#00b894",
    icon: ICONS.house,
    image: "/portfolio/bdweb.png",
    name: "BDweb",
    cat: "realestate",
    desc: {
      es: "Plataforma PropTech que conecta asesores, proveedores y propiedades con membresías y academia.",
      en: "A PropTech platform connecting advisors, vendors and properties with memberships and an academy.",
    },
    features: {
      es: ["Bolsa inmobiliaria avanzada", "CRM para asesores", "Sistema de membresías"],
      en: ["Advanced property listings", "CRM for advisors", "Membership system"],
    },
    stack: ["WordPress", "ACF", "MySQL"],
  },
  {
    slug: "programarte-plataforma-bienestar-mental",
    area: "c",
    accent: "#8a6bff",
    icon: ICONS.cap,
    image: "/portfolio/programarte.png",
    name: "Programarte",
    cat: "webdev",
    desc: {
      es: "Plataforma educativa con sesiones guiadas de bienestar mental y acceso seguro en la nube.",
      en: "An educational platform with guided mental-wellness sessions and secure cloud access.",
    },
    features: {
      es: ["Cursos y sesiones online", "Membresías y suscripciones", "Reproductor de audio seguro"],
      en: ["Online courses and sessions", "Memberships and subscriptions", "Secure audio player"],
    },
    stack: ["Next.js", "AWS", "Stripe"],
  },
  {
    slug: "conquer-classic-plus",
    area: "d",
    accent: "#ff4d6d",
    icon: ICONS.gamepad,
    image: "/portfolio/conquer-classic-plus.png",
    name: "Conquer Classic Plus",
    cat: "webdev",
    desc: {
      es: "Plataforma a medida para servidor privado de Conquer Online con registro, mercado y rankings.",
      en: "A custom platform for a Conquer Online private server with registration, marketplace and rankings.",
    },
    stack: ["Next.js", "MySQL", "Redis"],
  },
  {
    slug: "bodhi-medicine-plataforma-formacion-salud-holistica",
    area: "e",
    accent: "#fb8c2e",
    icon: ICONS.leaf,
    image: "/portfolio/bodhi-medicine.png",
    name: "Bodhi Medicine",
    cat: "lms",
    desc: {
      es: "Sitio multilingüe en WordPress para vender cursos, membresías y certificaciones de salud integrativa.",
      en: "A multilingual WordPress site selling courses, memberships and integrative-health certifications.",
    },
    stack: ["WordPress", "WooCommerce"],
  },
];

export default function Portfolio({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const p = dict.portfolio;

  return (
    <section className="pf2" id="portfolio">
      <Reveal className="pf2__head">
        <div className="pf2__intro">
          <p className="pf2__eyebrow">{p.eyebrow}</p>
          <h2 className="pf2__title">{p.title}</h2>
          <p className="pf2__sub">{p.text}</p>
        </div>
        <Link href={`/${locale}/portafolio`} className="pf2__all">
          {p.cta}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </Reveal>

      <div className="pf2__grid">
        {BENTO.map((b, i) => {
          const features = b.features?.[locale];
          return (
            <Link
              key={b.slug}
              href={`/${locale}/portafolio/${b.slug}`}
              className={`pf2-card${b.featured ? " pf2-card--featured" : ""}`}
              style={
                { gridArea: b.area, "--accent": b.accent, "--i": i } as React.CSSProperties
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="pf2-card__bg" src={b.image} alt="" aria-hidden="true" loading="lazy" draggable={false} />
              <span className="pf2-card__scrim" aria-hidden="true" />

              <span className="pf2-card__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d={b.icon} />
                </svg>
              </span>

              <span className="pf2-card__body">
                <span className="pf2-card__eyebrow">{p.categories[b.cat]}</span>
                <span className="pf2-card__name">
                  {b.name}
                  {b.nameAccent && <span className="pf2-card__name-accent">{b.nameAccent}</span>}
                </span>
                <span className="pf2-card__desc">{b.desc[locale]}</span>

                {features && (
                  <ul className="pf2-card__features">
                    {features.map((f) => (
                      <li key={f}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12l4 4 10-11" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                )}

                <span className="pf2-card__foot">
                  <span className="pf2-card__btn">
                    {b.featured ? p.seeMoreFeatured : p.seeMore}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                  <span className="pf2-card__stack">{b.stack.join(" · ")}</span>
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
