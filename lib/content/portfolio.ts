import data from "./portfolio.data.json";
import { db } from "@/lib/db";
import { safeQuery } from "./safe";

export type ProjectLocale = { title: string; short: string; long: string };

export type Project = {
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

const PROJECTS = data as Project[];

export function getAllProjects(): Project[] {
  return PROJECTS;
}

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

export function getAllProjectSlugs(): string[] {
  return PROJECTS.map((p) => p.slug);
}

/* ---- Lectura con override de DB (M3) — fallback al JSON ---- */

type ProjectRow = {
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
  locales: unknown;
  highlights: unknown;
  tags: unknown;
};

function mapRowToProject(row: ProjectRow): Project {
  const loc = (row.locales ?? {}) as { es?: ProjectLocale; en?: ProjectLocale };
  const empty: ProjectLocale = { title: "", short: "", long: "" };
  return {
    slug: row.slug,
    image: row.image,
    imageMobile: row.imageMobile,
    bg: row.bg,
    cat: row.cat,
    relatedService: row.relatedService,
    url: row.url,
    status: row.status,
    industry: row.industry,
    tech: row.tech,
    es: loc.es ?? empty,
    en: loc.en ?? empty,
    highlights: Array.isArray(row.highlights) ? (row.highlights as string[]) : [],
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
  };
}

export async function getAllProjectsAsync(): Promise<Project[]> {
  return safeQuery(async () => {
    const rows = await db.project.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
    });
    return rows.length ? rows.map(mapRowToProject) : PROJECTS;
  }, PROJECTS);
}

export async function getProjectAsync(slug: string): Promise<Project | undefined> {
  return safeQuery(async () => {
    const row = await db.project.findUnique({ where: { slug } });
    return row ? mapRowToProject(row) : getProject(slug);
  }, getProject(slug));
}
