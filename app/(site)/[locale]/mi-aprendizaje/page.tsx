import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionaryAsync } from "@/lib/i18n";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
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

  const dict = await getDictionaryAsync(l);
  const t = dict.lms.dashboard;

  const enrollments = await db.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          sections: {
            orderBy: { sortOrder: "asc" },
            include: { lessons: { orderBy: { sortOrder: "asc" }, select: { id: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  const done = new Set(
    (await db.lessonProgress.findMany({ where: { userId }, select: { lessonId: true } })).map((p) => p.lessonId),
  );

  return (
    <section className="lms-dash">
      <header className="lms-dash__head">
        <h1 className="lms-dash__title">{t.title}</h1>
        <p className="lms-dash__sub">{t.subtitle}</p>
      </header>

      {enrollments.length === 0 ? (
        <div className="lms-dash__empty">
          <p>{t.empty}</p>
          <Link href={`/${l}/cursos`} className="lms-enroll">{t.browse}</Link>
        </div>
      ) : (
        <ul className="lms-dash__grid">
          {enrollments.map((e) => {
            const lessons = e.course.sections.flatMap((s) => s.lessons);
            const total = lessons.length;
            const completed = lessons.filter((le) => done.has(le.id)).length;
            const pct = total ? Math.round((completed / total) * 100) : 0;
            const nextLesson = lessons.find((le) => !done.has(le.id)) ?? lessons[0];
            return (
              <li key={e.id} className="lms-dash__card">
                <span className="lms-dash__ctitle">{e.course.title}</span>
                <div className="lms-dash__bar"><span style={{ width: `${pct}%` }} /></div>
                <span className="lms-dash__pct">{t.progress}: {pct}%</span>
                {nextLesson && (
                  <Link href={`/${l}/cursos/${e.course.slug}/leccion/${nextLesson.id}`} className="lms-enroll lms-enroll--sm">
                    {t.continue}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
