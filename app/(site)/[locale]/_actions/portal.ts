"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/auth";

function userIdOf(session: unknown): string | undefined {
  return (session as { user?: { id?: string } } | null | undefined)?.user?.id;
}

async function ownsProject(userId: string, projectId: string): Promise<boolean> {
  const p = await db.clientProject.findUnique({ where: { id: projectId }, select: { clientId: true } });
  return !!p && p.clientId === userId;
}

export async function addProjectComment(
  projectId: string,
  body: string,
  locale: string,
): Promise<{ ok: boolean }> {
  const userId = userIdOf(await auth());
  if (!userId || !body.trim()) return { ok: false };
  if (!(await ownsProject(userId, projectId))) return { ok: false };
  await db.projectComment.create({ data: { projectId, authorId: userId, body: body.trim() } });
  revalidatePath(`/${locale}/portal/${projectId}`);
  return { ok: true };
}

const issueSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

export async function createIssue(
  projectId: string,
  input: { title: string; description: string; priority: string },
  locale: string,
): Promise<{ ok: boolean; error?: string }> {
  const userId = userIdOf(await auth());
  if (!userId) return { ok: false };
  if (!(await ownsProject(userId, projectId))) return { ok: false };

  const parsed = issueSchema.safeParse({
    title: input.title.trim(),
    description: input.description?.trim() || undefined,
    priority: input.priority,
  });
  if (!parsed.success) return { ok: false, error: "Falta el título." };

  await db.issue.create({
    data: {
      projectId,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      priority: parsed.data.priority,
      status: "OPEN",
      createdById: userId,
    },
  });
  revalidatePath(`/${locale}/portal/${projectId}`);
  return { ok: true };
}
