"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";

type QuoteStatus = "NEW" | "CONTACTED" | "CLOSED";

export async function setQuoteStatus(id: string, status: QuoteStatus) {
  await requireAdmin();
  await db.quote.update({ where: { id }, data: { status } });
}

export async function deleteQuote(id: string) {
  await requireAdmin();
  await db.quote.delete({ where: { id } });
}
