import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { SERVICES } from "@/lib/services";
import { FEATURES } from "@/lib/features";

export default function Footer({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const base = `/${locale}`;
  const year = 2026;

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <Link href={base} className="footer__logo">
            Alrit<span className="footer__logo-dot">.dev</span>
          </Link>
          <p className="footer__tagline">{dict.footer.tagline}</p>
        </div>

        <nav className="footer__col" aria-label={dict.footer.columns.services}>
          <h3 className="footer__heading">{dict.footer.columns.services}</h3>
          {SERVICES.map((s) => (
            <Link key={s.id} href={`${base}/servicios/${s.slug}`} className="footer__link">
              {dict.services.items[s.id].title}
            </Link>
          ))}
        </nav>

        <nav className="footer__col" aria-label={dict.footer.columns.company}>
          <h3 className="footer__heading">{dict.footer.columns.company}</h3>
          <Link href={`${base}/portafolio`} className="footer__link">
            {dict.footer.company.portfolio}
          </Link>
          {FEATURES.blog && (
            <Link href={`${base}/blog`} className="footer__link">
              {dict.footer.company.blog}
            </Link>
          )}
          <Link href={`${base}#process`} className="footer__link">
            {dict.footer.company.process}
          </Link>
          <Link href={`${base}/servicios`} className="footer__link">
            {dict.nav.services}
          </Link>
        </nav>

        <div className="footer__col">
          <h3 className="footer__heading">{dict.footer.columns.contact}</h3>
          <a href="mailto:hola@alrit.dev" className="footer__link">
            hola@alrit.dev
          </a>
          <a href="https://wa.me/520000000000" className="footer__link">
            WhatsApp
          </a>
        </div>
      </div>

      <div className="footer__bar">
        <span>© {year} Alrit.dev. {dict.footer.rights}</span>
      </div>
    </footer>
  );
}
