import { db } from "@/lib/db";
import { safeQuery } from "@/lib/content/safe";
import { getDictionary } from "@/lib/i18n";
import { formatMXN } from "@/lib/pricing";
import QuotesList from "./_list";

export const dynamic = "force-dynamic";

export default async function QuotesPage() {
  const quotes = await safeQuery(() => db.quote.findMany({ orderBy: { createdAt: "desc" } }), []);
  const t = getDictionary("es").calculator;

  const rows = quotes.map((q) => ({
    id: q.id,
    name: q.name,
    email: q.email,
    phone: q.phone,
    brief: q.brief,
    type: t.types[q.projectType as keyof typeof t.types]?.name ?? q.projectType,
    extras: (Array.isArray(q.extras) ? (q.extras as string[]) : []).map(
      (e) => t.extras[e as keyof typeof t.extras] ?? e,
    ),
    amount: q.custom ? "A medida" : q.amount != null ? formatMXN(q.amount) : "—",
    status: q.status,
    date: q.createdAt.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }),
  }));

  return (
    <>
      <header className="adm__head">
        <h1 className="adm__title">Cotizaciones</h1>
        <p className="adm__subtitle">Solicitudes recibidas desde la calculadora.</p>
      </header>
      <QuotesList quotes={rows} />
    </>
  );
}
