import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { locales, isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionaryAsync } from "@/lib/i18n";
import { getCourseBySlugAsync, getAllCourseSlugs } from "@/lib/content/courses";
import { formatMXN } from "@/lib/pricing";
import EnrollButton from "@/components/courses/EnrollButton";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllCourseSlugs();
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const course = await getCourseBySlugAsync(slug);
  if (!course) return {};
  return {
    title: `${course.title} | Alrit.dev`,
    description: course.summary,
    alternates: {
      canonical: `/${locale}/cursos/${slug}`,
      languages: { es: `/es/cursos/${slug}`, en: `/en/cursos/${slug}` },
    },
  };
}

export default async function CourseLandingPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const course = await getCourseBySlugAsync(slug);
  if (!course) notFound();

  const l = locale as Locale;
  const dict = await getDictionaryAsync(l);
  const t = dict.lms.course;
  const lessonCount = course.sections.reduce((n, s) => n + s.lessons.length, 0);
  const priceLabel = course.priceCents === 0 ? t.enroll : `${t.enroll} · ${formatMXN(Math.round(course.priceCents / 100))}`;

  return (
    <article className="lms-course">
      <header className="lms-course__hero">
        {course.coverImage && (
          <div className="lms-course__cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={course.coverImage} alt={course.title} />
          </div>
        )}
        <p className="lms-course__level">{t.level}: {course.level}</p>
        <h1 className="lms-course__title">{course.title}</h1>
        <p className="lms-course__summary">{course.summary}</p>
        <div className="lms-course__actions">
          <EnrollButton courseSlug={course.slug} locale={l} label={priceLabel} />
          <span className="lms-course__count">{lessonCount} {t.lessonsLabel}</span>
        </div>
      </header>

      {course.description && (
        <div className="lms-course__desc">
          <p>{course.description}</p>
        </div>
      )}

      <section className="lms-course__curriculum">
        <h2 className="lms-course__h2">{t.curriculum}</h2>
        {course.sections.map((s) => (
          <div className="lms-sec" key={s.id}>
            <h3 className="lms-sec__title">{s.title}</h3>
            <ul className="lms-sec__lessons">
              {s.lessons.map((les) =>
                les.preview ? (
                  <li key={les.id}>
                    <Link href={`/${l}/cursos/${slug}/leccion/${les.id}`} className="lms-lesson lms-lesson--preview">
                      <span className="lms-lesson__title">{les.title}</span>
                      <span className="lms-lesson__tag">{t.preview}</span>
                    </Link>
                  </li>
                ) : (
                  <li key={les.id}>
                    <span className="lms-lesson">
                      <span className="lms-lesson__title">{les.title}</span>
                      {les.durationMin ? <span className="lms-lesson__dur">{les.durationMin} min</span> : null}
                    </span>
                  </li>
                ),
              )}
            </ul>
          </div>
        ))}
      </section>
    </article>
  );
}
