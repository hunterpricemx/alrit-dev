import { db } from "@/lib/db";
import { safeQuery } from "./safe";
import { BRAND_LOGOS, TECH_LOGOS, type LogoItem } from "./logos.data";

export type { LogoItem };

export async function getLogosAsync(group: "BRAND" | "TECH"): Promise<LogoItem[]> {
  const fallback = group === "BRAND" ? BRAND_LOGOS : TECH_LOGOS;
  return safeQuery(async () => {
    const rows = await db.logo.findMany({
      where: { group, published: true },
      orderBy: { sortOrder: "asc" },
    });
    return rows.length ? rows.map((r) => ({ name: r.name, image: r.image })) : fallback;
  }, fallback);
}
