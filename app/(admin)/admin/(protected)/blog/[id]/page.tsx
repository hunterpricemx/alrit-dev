import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { safeQuery } from "@/lib/content/safe";
import { deletePost } from "../../../_actions/blog";
import PostForm, { type PostInitial } from "../_form";

export const dynamic = "force-dynamic";

type Loc = { title?: string; excerpt?: string; body?: string };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await safeQuery(() => db.post.findUnique({ where: { id } }), null);
  if (!p) notFound();

  const loc = (p.locales as { es?: Loc; en?: Loc }) ?? {};
  const media = await safeQuery(() => db.media.findMany({ orderBy: { createdAt: "desc" } }), []);

  const initial: PostInitial = {
    id: p.id,
    slug: p.slug,
    category: p.category,
    cover: p.cover ?? "",
    author: p.author,
    publishedAt: p.publishedAt ? p.publishedAt.toISOString().slice(0, 10) : "",
    published: p.published,
    es_title: loc.es?.title ?? "",
    es_excerpt: loc.es?.excerpt ?? "",
    es_body: loc.es?.body ?? "",
    en_title: loc.en?.title ?? "",
    en_excerpt: loc.en?.excerpt ?? "",
    en_body: loc.en?.body ?? "",
  };

  return (
    <>
      <header className="adm__head">
        <h1 className="adm__title">Editar artículo</h1>
        <p className="adm__subtitle">{p.slug}</p>
      </header>
      <PostForm initial={initial} media={media} isNew={false} />
      <form
        className="adm-danger"
        action={async () => {
          "use server";
          await deletePost(id);
          redirect("/admin/blog");
        }}
      >
        <button type="submit" className="adm-danger__btn">Eliminar artículo</button>
      </form>
    </>
  );
}
