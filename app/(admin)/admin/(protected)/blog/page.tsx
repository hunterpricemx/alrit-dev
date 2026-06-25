import Link from "next/link";
import { db } from "@/lib/db";
import { safeQuery } from "@/lib/content/safe";
import { categoryLabel } from "@/lib/content/blog-categories";

export const dynamic = "force-dynamic";

export default async function BlogAdminPage() {
  const posts = await safeQuery(() => db.post.findMany({ orderBy: { updatedAt: "desc" } }), []);

  return (
    <>
      <header className="adm__head adm__head--row">
        <div>
          <h1 className="adm__title">Blog</h1>
          <p className="adm__subtitle">Artículos del blog (Markdown, bilingüe).</p>
        </div>
        <Link href="/admin/blog/new" className="adm-btn">Nuevo artículo</Link>
      </header>

      <div className="adm-panel">
        {posts.length === 0 ? (
          <p className="adm-row__hint">Aún no hay artículos.</p>
        ) : (
          <ul className="adm-list">
            {posts.map((p) => {
              const title = (p.locales as { es?: { title?: string } })?.es?.title ?? p.slug;
              return (
                <li className="adm-list__row" key={p.id}>
                  <span className="adm-list__name">{title}</span>
                  <span className="adm-list__meta">
                    {categoryLabel(p.category, "es")} · {p.published ? "publicado" : "borrador"}
                  </span>
                  <Link href={`/admin/blog/${p.id}`} className="adm-list__edit">Editar</Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
