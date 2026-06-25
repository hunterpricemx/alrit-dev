"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { FEATURES } from "@/lib/features";

const schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(190),
  password: z.string().min(8).max(200),
});

export type RegisterState = { ok: boolean; error?: string };

/** Crea un usuario con rol STUDENT. El login (signIn) lo hace el cliente tras el alta. */
export async function registerStudent(input: {
  name: string;
  email: string;
  password: string;
}): Promise<RegisterState> {
  if (!FEATURES.lms) return { ok: false, error: "El registro no está disponible." };
  const parsed = schema.safeParse({
    name: input.name?.trim(),
    email: input.email?.trim().toLowerCase(),
    password: input.password,
  });
  if (!parsed.success) {
    return { ok: false, error: "Revisa los datos (la contraseña debe tener mínimo 8 caracteres)." };
  }
  const { name, email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { ok: false, error: "Ese email ya está registrado." };

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    await db.user.create({ data: { name, email, passwordHash, role: "STUDENT" } });
  } catch {
    return { ok: false, error: "No se pudo crear la cuenta." };
  }
  return { ok: true };
}
