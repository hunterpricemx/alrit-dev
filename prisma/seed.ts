import { PrismaClient } from "@prisma/client";
import projects from "../lib/content/portfolio.data.json";
import { PROJECT_TYPES, EXTRAS } from "../lib/pricing";

const db = new PrismaClient();

type ProjectLocale = { title: string; short: string; long: string };
type RawProject = {
  slug: string;
  image: string;
  imageMobile: string;
  bg: string;
  cat: string;
  relatedService: string;
  url: string;
  status: string;
  industry: string;
  tech: string;
  es: ProjectLocale;
  en: ProjectLocale;
  highlights: string[];
  tags: string[];
};

async function main() {
  // ---- Admin user ----
  const email = process.env.ADMIN_EMAIL;
  const hash = process.env.ADMIN_PASSWORD_HASH;
  const name = process.env.ADMIN_NAME ?? null;
  if (email && hash) {
    await db.user.upsert({
      where: { email },
      create: { email, name, passwordHash: hash, role: "ADMIN" },
      update: { passwordHash: hash, name },
    });
    console.log("✓ admin:", email);
  } else {
    console.warn("⚠ ADMIN_EMAIL / ADMIN_PASSWORD_HASH no definidos — admin no sembrado.");
  }

  // ---- Pricing ----
  for (let i = 0; i < PROJECT_TYPES.length; i++) {
    const t = PROJECT_TYPES[i];
    await db.pricingType.upsert({
      where: { id: t.id },
      create: { id: t.id, base: t.base, weeks: t.weeks, sortOrder: i },
      update: { base: t.base, weeks: t.weeks, sortOrder: i },
    });
  }
  const extras = EXTRAS as Record<string, number>;
  const extraIds = Object.keys(extras);
  for (let i = 0; i < extraIds.length; i++) {
    const id = extraIds[i];
    await db.pricingExtra.upsert({
      where: { id },
      create: { id, price: extras[id], sortOrder: i },
      update: { price: extras[id], sortOrder: i },
    });
  }
  console.log(`✓ pricing: ${PROJECT_TYPES.length} tipos, ${extraIds.length} extras`);

  // ---- Projects ----
  const list = projects as RawProject[];
  for (let i = 0; i < list.length; i++) {
    const p = list[i];
    const data = {
      image: p.image,
      imageMobile: p.imageMobile,
      bg: p.bg,
      cat: p.cat,
      relatedService: p.relatedService,
      url: p.url,
      status: p.status,
      industry: p.industry,
      tech: p.tech,
      locales: { es: p.es, en: p.en },
      highlights: p.highlights,
      tags: p.tags,
      sortOrder: i,
    };
    await db.project.upsert({
      where: { slug: p.slug },
      create: { slug: p.slug, ...data },
      update: data,
    });
  }
  console.log(`✓ ${list.length} proyectos`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await db.$disconnect();
    process.exit(1);
  });
