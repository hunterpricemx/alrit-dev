import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { safeQuery } from "@/lib/content/safe";
import { getDictionary } from "@/lib/i18n";
import { deleteProject } from "../../../_actions/clients";
import ProjectForm from "../_form";
import ClientPanel from "../_panel";

export const dynamic = "force-dynamic";

function fmt(d: Date): string {
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function ManageClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = await safeQuery(
    () =>
      db.clientProject.findUnique({
        where: { id },
        include: {
          client: { select: { name: true, email: true } },
          phases: { orderBy: { sortOrder: "asc" } },
          updates: { orderBy: { createdAt: "desc" } },
          issues: { orderBy: { createdAt: "desc" } },
          comments: { orderBy: { createdAt: "asc" }, include: { author: { select: { name: true, role: true } } } },
        },
      }),
    null,
  );
  if (!p) notFound();

  const portal = getDictionary("es").portal;
  const project = {
    id: p.id,
    phases: p.phases.map((x) => ({ id: x.id, title: x.title, done: x.done })),
    updates: p.updates.map((u) => ({ id: u.id, body: u.body, date: fmt(u.createdAt) })),
    issues: p.issues.map((it) => ({ id: it.id, title: it.title, description: it.description, priority: it.priority, status: it.status })),
    comments: p.comments.map((c) => ({
      id: c.id,
      body: c.body,
      date: fmt(c.createdAt),
      author: c.author.role === "CLIENT" ? (c.author.name ?? "Cliente") : "Equipo Alrit",
    })),
  };

  return (
    <>
      <header className="adm__head">
        <h1 className="adm__title">{p.name}</h1>
        <p className="adm__subtitle">{p.client?.name} · {p.client?.email}</p>
      </header>

      <ProjectForm initial={{ id: p.id, name: p.name, summary: p.summary ?? "", status: p.status }} />
      <ClientPanel project={project} labels={{ priority: portal.priorityLabels, status: portal.statusLabels }} />

      <form
        className="adm-danger"
        action={async () => {
          "use server";
          await deleteProject(id);
          redirect("/admin/clientes");
        }}
      >
        <button type="submit" className="adm-danger__btn">Eliminar proyecto</button>
      </form>
    </>
  );
}
