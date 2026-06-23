import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import Reveal from "@/components/ui/Reveal";

export default function FinalCta({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  return (
    <section className="final-cta">
      <Reveal className="final-cta__panel">
        <h2 className="final-cta__title">{dict.finalCta.title}</h2>
        <p className="final-cta__text">{dict.finalCta.text}</p>
        <div className="final-cta__actions">
          <Link href={`/${locale}#calculator`} className="final-cta__btn final-cta__btn--primary">
            {dict.finalCta.primary}
          </Link>
          <a href="https://wa.me/520000000000" className="final-cta__btn final-cta__btn--ghost">
            {dict.finalCta.secondary}
          </a>
        </div>
      </Reveal>
    </section>
  );
}
