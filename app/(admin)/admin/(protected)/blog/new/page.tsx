import { db } from "@/lib/db";
import { safeQuery } from "@/lib/content/safe";
import PostForm, { type PostInitial } from "../_form";

export const dynamic = "force-dynamic";

const EMPTY: PostInitial = {
  id: "",
  slug: "",
  category: "",
  cover: "",
  author: "Equipo Alrit",
  publishedAt: "",
  published: false,
  es_title: "",
  es_excerpt: "",
  es_body: "",
  en_title: "",
  en_excerpt: "",
  en_body: "",
};

export default async function NewPostPage() {
  const media = await safeQuery(() => db.media.findMany({ orderBy: { createdAt: "desc" } }), []);
  return (
    <>
      <header className="adm__head">
        <h1 className="adm__title">Nuevo artículo</h1>
      </header>
      <PostForm initial={EMPTY} media={media} isNew />
    </>
  );
}
