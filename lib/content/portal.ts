import { db } from "@/lib/db";
import { safeQuery } from "./safe";

export async function getClientProjectsAsync(userId: string) {
  return safeQuery(
    () =>
      db.clientProject.findMany({
        where: { clientId: userId },
        orderBy: { createdAt: "desc" },
        include: { phases: { select: { done: true } } },
      }),
    [],
  );
}

/** Proyecto con todo su detalle SOLO si pertenece al usuario (aislamiento). */
export async function getClientProjectAsync(userId: string, projectId: string) {
  return safeQuery(async () => {
    const p = await db.clientProject.findUnique({
      where: { id: projectId },
      include: {
        phases: { orderBy: { sortOrder: "asc" } },
        updates: { orderBy: { createdAt: "desc" } },
        issues: { orderBy: { createdAt: "desc" } },
        comments: { orderBy: { createdAt: "asc" }, include: { author: { select: { name: true, role: true } } } },
      },
    });
    if (!p || p.clientId !== userId) return null;
    return p;
  }, null);
}

export function progressPct(phases: { done: boolean }[]): number {
  const total = phases.length;
  if (!total) return 0;
  return Math.round((phases.filter((p) => p.done).length / total) * 100);
}
