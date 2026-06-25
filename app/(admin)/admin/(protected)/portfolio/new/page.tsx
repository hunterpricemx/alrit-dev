import { db } from "@/lib/db";
import { safeQuery } from "@/lib/content/safe";
import ProjectForm, { type ProjectInitial } from "../_form";

export const dynamic = "force-dynamic";

const EMPTY: ProjectInitial = {
  slug: "",
  image: "",
  imageMobile: "",
  bg: "#0f0f14",
  cat: "webdev",
  relatedService: "webdev",
  url: "",
  status: "live",
  industry: "",
  tech: "",
  es_name: "",
  es_title: "",
  es_short: "",
  es_long: "",
  en_name: "",
  en_title: "",
  en_short: "",
  en_long: "",
  highlights: "",
  tags: "",
  published: true,
  sortOrder: 0,
  featured: false,
  accent: "",
  icon: "",
};

export default async function NewProjectPage() {
  const media = await safeQuery(
    () => db.media.findMany({ orderBy: { createdAt: "desc" } }),
    [],
  );

  return (
    <>
      <header className="adm__head">
        <h1 className="adm__title">Nuevo proyecto</h1>
        <p className="adm__subtitle">Crea un caso de portafolio.</p>
      </header>
      <ProjectForm initial={EMPTY} media={media} isNew />
    </>
  );
}
