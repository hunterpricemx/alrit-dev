"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getSettingsAsync } from "@/lib/content/settings";
import { sendMail, isMailConfigured } from "@/lib/mail/sender";
import { formatMXN } from "@/lib/pricing";

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

  // Aviso de lead al negocio (best-effort: no rompe el guardado).
  try {
    await notifyNewLead(parsed.data);
  } catch {
    // silencioso
  }

  return { ok: true };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
}

/** Envía un correo al negocio con los datos del lead + botones para responder. */
async function notifyNewLead(lead: z.infer<typeof schema>): Promise<void> {
  if (!isMailConfigured()) return;
  const settings = await getSettingsAsync();
  const to = process.env.LEADS_NOTIFY_TO || settings.email;
  if (!to) return;

  const isContact = lead.projectType === "contacto";
  const amount = lead.amount != null ? formatMXN(lead.amount) : lead.custom ? "A medida / cotización" : "—";
  const waLink = lead.phone ? `https://wa.me/${lead.phone.replace(/\D/g, "")}` : null;

  const rows: [string, string][] = [
    ["Nombre", lead.name],
    ["Email", lead.email],
    ...(lead.phone ? ([["Teléfono", lead.phone]] as [string, string][]) : []),
    ["Tipo", isContact ? "Mensaje de contacto" : lead.projectType],
    ...(lead.extras.length ? ([["Extras", lead.extras.join(", ")]] as [string, string][]) : []),
    ...(!isContact ? ([["Estimado", amount]] as [string, string][]) : []),
    ...(lead.brief ? ([["Mensaje", lead.brief]] as [string, string][]) : []),
  ];

  const btn = "display:inline-block;padding:9px 14px;border-radius:8px;font-weight:600;text-decoration:none;font-size:14px";
  const html = `
  <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:560px;color:#111">
    <h2 style="margin:0 0 14px">${isContact ? "📩 Nuevo mensaje de contacto" : "🎯 Nuevo lead de la calculadora"}</h2>
    <table style="border-collapse:collapse;width:100%">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:6px 10px;color:#777;vertical-align:top;white-space:nowrap">${k}</td><td style="padding:6px 10px;font-weight:600">${escapeHtml(v).replace(/\n/g, "<br>")}</td></tr>`,
        )
        .join("")}
    </table>
    <p style="margin:18px 0 0">
      <a href="mailto:${lead.email}" style="${btn};background:#111;color:#fff">Responder por email</a>
      ${waLink ? `&nbsp;<a href="${waLink}" style="${btn};background:#25d366;color:#fff">Responder por WhatsApp</a>` : ""}
    </p>
    <p style="color:#999;font-size:12px;margin-top:18px">Enviado automáticamente desde alrit.dev</p>
  </div>`;

  await sendMail({
    to,
    subject: `${isContact ? "Contacto" : "Lead"}: ${lead.name.replace(/\s+/g, " ").slice(0, 80)}`,
    html,
    replyTo: lead.email,
  });
}
