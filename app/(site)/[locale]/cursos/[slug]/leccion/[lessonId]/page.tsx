import { notFound } from "next/navigation";
import Link from "next/link";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionaryAsync } from "@/lib/i18n";
import { getCourseBySlugAsync, toEmbedUrl } from "@/lib/content/courses";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import EnrollButton from "@/components/courses/EnrollButton";
import CompleteButton from "@/components/courses/CompleteButton";
import { FEATURES } from "@/lib/features";

export const dynamic = "force-dynamic";

export default async function LessonPlayerPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string; lessonId: string }>;
}) {
  if (!FEATURES.lms) notFound();
  const { locale, slug, lessonId } = await params;
  if (!isLocale(locale)) notFound();
  const course = await getCourseBySlugAsync(slug);
  if (!course) notFound();

  const l = locale as Locale;
  const dict = await getDictionaryAsync(l);
  const t = dict.lms.player;
  const tc = dict.lms.course;

  const lessons = course.sections.flatMap((s) => s.lessons);
  const idx = lessons.findIndex((x) => x.id === lessonId);
  const lesson = lessons[idx];
  if (!lesson) notFound();

  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const enrolled = userId
    ? !!(await db.enrollment.findUnique({ where: { userId_courseId: { userId, courseId: course.id } } }))
    : false;
  const canView = lesson.preview || enrolled;

  const completedIds = userId
    ? new Set(
        (
          await db.lessonProgress.findMany({
            where: { userId, lesson: { section: { courseId: course.id } } },
            select: { lessonId: true },
          })
        ).map((p) => p.lessonId),
      )
    : new Set<string>();

  const prev = lessons[idx - 1];
  const next = lessons[idx + 1];
  const embed = canView ? toEmbedUrl(lesson.videoUrl) : null;

  return (
    <div className="lms-player">
      <aside className="lms-player__side">
        <Link href={`/${l}/cursos/${slug}`} className="lms-player__back">← {t.backToCourse}</Link>
        {course.sections.map((s) => (
          <div key={s.id} className="lms-player__sec">
            <p className="lms-player__sectitle">{s.title}</p>
            <ul>
              {s.lessons.map((les) => {
                const locked = !les.preview && !enrolled;
                const active = les.id === lessonId;
                const isDone = completedIds.has(les.id);
                return (
                  <li key={les.id}>
                    {locked ? (
                      <span className="lms-player__lesson is-locked">{les.title}</span>
                    ) : (
                      <Link
                        href={`/${l}/cursos/${slug}/leccion/${les.id}`}
                        className={`lms-player__lesson${active ? " is-active" : ""}${isDone ? " is-done" : ""}`}
                      >
                        {les.title}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </aside>

      <main className="lms-player__main">
        {canView ? (
          <>
            {embed && (
              <div className="lms-player__video">
                <iframe src={embed} title={lesson.title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
              </div>
            )}
            <h1 className="lms-player__title">{lesson.title}</h1>
            {lesson.content && <div className="lms-player__content">{lesson.content}</div>}
            <div className="lms-player__nav">
              {prev ? (
                <Link href={`/${l}/cursos/${slug}/leccion/${prev.id}`} className="lms-player__navbtn">← {t.prev}</Link>
              ) : (
                <span />
              )}
              {userId && enrolled && (
                <CompleteButton
                  lessonId={lesson.id}
                  locale={l}
                  completed={completedIds.has(lesson.id)}
                  completeLabel={t.complete}
                  completedLabel={t.completed}
                />
              )}
              {next ? (
                <Link href={`/${l}/cursos/${slug}/leccion/${next.id}`} className="lms-player__navbtn">{t.next} →</Link>
              ) : (
                <span />
              )}
            </div>
          </>
        ) : (
          <div className="lms-player__locked">
            <h1 className="lms-player__title">{t.lockedTitle}</h1>
            <p>{t.lockedText}</p>
            <EnrollButton courseSlug={course.slug} locale={l} label={tc.enroll} />
          </div>
        )}
      </main>
    </div>
  );
}
