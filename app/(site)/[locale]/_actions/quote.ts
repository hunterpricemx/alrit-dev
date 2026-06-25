"use server";

import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  name: z.string().min(1).max(160),
  email: z.string().email().max(190),
  phone: z.string().max(60).optional(),
  brief: z.string().max(4000).optional(),
  projectType: z.string().min(1),
  extras: z.array(z.string()),
  amount: z.number().int().nullable(),
  custom: z.boolean(),
});

/** Guarda una cotización de la calculadora (lead público, sin auth). */
export async function submitQuote(input: {
  name: string;
  email: string;
  phone: string;
  brief: string;
  projectType: string;
  extras: string[];
  amount: number | null;
  custom: boolean;
}): Promise<{ ok: boolean }> {
  const parsed = schema.safeParse({
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim() || undefined,
    brief: input.brief.trim() || undefined,
    projectType: input.projectType,
    extras: input.extras,
    amount: input.amount,
    custom: input.custom,
  });
  if (!parsed.success) return { ok: false };

  try {
    await db.quote.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone ?? null,
        brief: parsed.data.brief ?? null,
        projectType: parsed.data.projectType,
        extras: parsed.data.extras,
        amount: parsed.data.amount,
        custom: parsed.data.custom,
      },
    });
  } catch {
    return { ok: false };
  }
  return { ok: true };
}
