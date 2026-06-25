import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { safeQuery } from "@/lib/content/safe";
import { deleteProject } from "../../../_actions/portfolio";
import ProjectForm, { type ProjectInitial } from "../_form";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await safeQuery(() => db.project.findUnique({ where: { slug } }), null);
  if (!p) notFound();

  const loc = (p.locales as { es?: Loc; en?: Loc }) ?? {};
  const media = await safeQuery(
    () => db.media.findMany({ orderBy: { createdAt: "desc" } }),
    [],
  );

  const initial: ProjectInitial = {
    slug: p.slug,
    image: p.image,
    imageMobile: p.imageMobile,
    bg: p.bg,
    cat: p.cat,
    relatedService: p.relatedService,
    url: p.url,
    status: p.status,
    industry: p.industry,
    tech: p.tech,
    es_name: loc.es?.name ?? "",
    es_title: loc.es?.title ?? "",
    es_short: loc.es?.short ?? "",
    es_long: loc.es?.long ?? "",
    en_name: loc.en?.name ?? "",
    en_title: loc.en?.title ?? "",
    en_short: loc.en?.short ?? "",
    en_long: loc.en?.long ?? "",
    highlights: (Array.isArray(p.highlights) ? (p.highlights as string[]) : []).join("\n"),
    tags: (Array.isArray(p.tags) ? (p.tags as string[]) : []).join("\n"),
    published: p.published,
    sortOrder: p.sortOrder,
  };

  return (
    <>
      <header className="adm__head">
        <h1 className="adm__title">Editar proyecto</h1>
        <p className="adm__subtitle">{p.slug}</p>
      </header>

      <ProjectForm initial={initial} media={media} isNew={false} />

      <form
        className="adm-danger"
        action={async () => {
          "use server";
          await deleteProject(slug);
          redirect("/admin/portfolio");
        }}
      >
        <button type="submit" className="adm-danger__btn">Eliminar proyecto</button>
      </form>
    </>
  );
}

type Loc = { name?: string; title?: string; short?: string; long?: string };
