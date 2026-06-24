import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { locales, isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionaryAsync } from "@/lib/i18n";
import { getPublishedCoursesAsync } from "@/lib/content/courses";
import { formatMXN } from "@/lib/pricing";

export const revalidate = 3600;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionaryAsync(locale as Locale);
  const t = dict.lms.catalog;
  return {
    title: `${t.title} | Alrit.dev`,
    description: t.subtitle,
    alternates: { canonical: `/${locale}/cursos`, languages: { es: "/es/cursos", en: "/en/cursos" } },
  };
}

export default async function CoursesCatalogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l = locale as Locale;
  const dict = await getDictionaryAsync(l);
  const t = dict.lms.catalog;
  const tc = dict.lms.course;
  const courses = await getPublishedCoursesAsync();

  return (
    <section className="lms-cat">
      <header className="lms-cat__head">
        <p className="lms-cat__eyebrow">{t.eyebrow}</p>
        <h1 className="lms-cat__title">{t.title}</h1>
        <p className="lms-cat__sub">{t.subtitle}</p>
      </header>

      {courses.length === 0 ? (
        <p className="lms-cat__empty">{t.empty}</p>
      ) : (
        <ul className="lms-cat__grid">
          {courses.map((c) => (
            <li key={c.slug}>
              <Link href={`/${l}/cursos/${c.slug}`} className="lms-card">
                <span className="lms-card__media">
                  {c.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.coverImage} alt={c.title} loading="lazy" />
                  ) : (
                    <span className="lms-card__ph" aria-hidden="true" />
                  )}
                </span>
                <span className="lms-card__body">
                  <span className="lms-card__level">{c.level}</span>
                  <span className="lms-card__title">{c.title}</span>
                  <span className="lms-card__sum">{c.summary}</span>
                  <span className="lms-card__meta">
                    {c.lessonCount} {tc.lessonsLabel} · {c.priceCents === 0 ? t.free : formatMXN(Math.round(c.priceCents / 100))}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
