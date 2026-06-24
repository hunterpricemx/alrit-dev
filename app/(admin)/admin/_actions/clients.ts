"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";
import { auth } from "@/auth";

type IssueStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";
type IssuePriority = "LOW" | "MEDIUM" | "HIGH";

function revalidatePortal() {
  revalidatePath("/[locale]/portal", "layout");
}
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

export type ClientProjectState = { ok: boolean; error?: string; id?: string };

const createSchema = z.object({
  clientName: z.string().min(1),
  clientEmail: z.string().email(),
  clientPassword: z.string().min(8),
  projectName: z.string().min(1),
});

export async function createClientProject(_prev: ClientProjectState, fd: FormData): Promise<ClientProjectState> {
  await requireAdmin();
  const data = {
    clientName: str(fd, "clientName"),
    clientEmail: str(fd, "clientEmail").toLowerCase(),
    clientPassword: str(fd, "clientPassword"),
    projectName: str(fd, "projectName"),
  };
  const parsed = createSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: "Revisa los datos (contraseña ≥ 8 caracteres)." };

  let user = await db.user.findUnique({ where: { email: data.clientEmail } });
  if (!user) {
    const passwordHash = await bcrypt.hash(data.clientPassword, 10);
    user = await db.user.create({ data: { name: data.clientName, email: data.clientEmail, passwordHash, role: "CLIENT" } });
  }
  const project = await db.clientProject.create({
    data: { name: data.projectName, summary: str(fd, "summary") || null, clientId: user.id },
  });
  revalidatePortal();
  return { ok: true, id: project.id };
}

export async function saveProject(_prev: ClientProjectState, fd: FormData): Promise<ClientProjectState> {
  await requireAdmin();
  const id = str(fd, "id");
  if (!id) return { ok: false, error: "Proyecto inválido." };
  await db.clientProject.update({
    where: { id },
    data: { name: str(fd, "name"), summary: str(fd, "summary") || null, status: str(fd, "status") || "en progreso" },
  });
  revalidatePortal();
  return { ok: true, id };
}

export async function deleteProject(id: string) {
  await requireAdmin();
  await db.clientProject.delete({ where: { id } });
  revalidatePortal();
}

export async function addPhase(projectId: string, title: string) {
  await requireAdmin();
  const sortOrder = await db.phase.count({ where: { projectId } });
  await db.phase.create({ data: { projectId, title: title.trim() || "Fase", sortOrder } });
  revalidatePortal();
}
export async function togglePhase(id: string, done: boolean) {
  await requireAdmin();
  await db.phase.update({ where: { id }, data: { done } });
  revalidatePortal();
}
export async function deletePhase(id: string) {
  await requireAdmin();
  await db.phase.delete({ where: { id } });
  revalidatePortal();
}

export async function postUpdate(projectId: string, body: string) {
  await requireAdmin();
  if (body.trim()) await db.projectUpdate.create({ data: { projectId, body: body.trim() } });
  revalidatePortal();
}
export async function deleteUpdate(id: string) {
  await requireAdmin();
  await db.projectUpdate.delete({ where: { id } });
  revalidatePortal();
}

export async function setIssueStatus(id: string, status: IssueStatus) {
  await requireAdmin();
  await db.issue.update({ where: { id }, data: { status } });
  revalidatePortal();
}
export async function setIssuePriority(id: string, priority: IssuePriority) {
  await requireAdmin();
  await db.issue.update({ where: { id }, data: { priority } });
  revalidatePortal();
}
export async function deleteIssue(id: string) {
  await requireAdmin();
  await db.issue.delete({ where: { id } });
  revalidatePortal();
}

export async function adminAddComment(projectId: string, body: string) {
  await requireAdmin();
  const session = await auth();
  const authorId = (session?.user as { id?: string } | undefined)?.id;
  if (!authorId || !body.trim()) return;
  await db.projectComment.create({ data: { projectId, authorId, body: body.trim() } });
  revalidatePortal();
}
