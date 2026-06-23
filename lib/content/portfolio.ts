import data from "./portfolio.data.json";

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
