import { db } from "@/lib/db";
import { safeQuery } from "@/lib/content/safe";
import LogosList from "./_list";

export const dynamic = "force-dynamic";

export default async function LogosPage() {
  const [logos, media] = await Promise.all([
    safeQuery(() => db.logo.findMany({ orderBy: { sortOrder: "asc" } }), []),
    safeQuery(() => db.media.findMany({ orderBy: { createdAt: "desc" } }), []),
  ]);
  const brand = logos.filter((l) => l.group === "BRAND");
  const tech = logos.filter((l) => l.group === "TECH");

  return (
    <>
      <header className="adm__head">
        <h1 className="adm__title">Logos</h1>
        <p className="adm__subtitle">Marcas de clientes y tecnologías que se muestran en el home.</p>
      </header>
      <LogosList brand={brand} tech={tech} media={media} />
    </>
  );
}
