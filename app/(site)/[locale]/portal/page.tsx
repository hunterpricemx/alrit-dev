import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionaryAsync } from "@/lib/i18n";
import { auth } from "@/auth";
import { getClientProjectsAsync, progressPct } from "@/lib/content/portal";

export const dynamic = "force-dynamic";

export default async function PortalListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l = locale as Locale;

  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect(`/${l}/ingresar`);

  const t = (await getDictionaryAsync(l)).portal;
  const projects = await getClientProjectsAsync(userId);

  return (
    <section className="portal">
      <header className="portal__head">
        <h1 className="portal__title">{t.title}</h1>
        <p className="portal__sub">{t.subtitle}</p>
      </header>

      {projects.length === 0 ? (
        <p className="portal__empty">{t.noProjects}</p>
      ) : (
        <ul className="portal__grid">
          {projects.map((p) => {
            const pct = progressPct(p.phases);
            return (
              <li key={p.id}>
                <Link href={`/${l}/portal/${p.id}`} className="portal-pcard">
                  <span className="portal-pcard__name">{p.name}</span>
                  <span className="portal-pcard__status">{p.status}</span>
                  <div className="portal-prog"><span style={{ width: `${pct}%` }} /></div>
                  <span className="portal-prog__label">{t.progress}: {pct}%</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
