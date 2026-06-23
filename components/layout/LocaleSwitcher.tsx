"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";

export default function LocaleSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  const swap = (target: Locale) => {
    const segments = pathname.split("/");
    segments[1] = target; // first segment after leading slash is the locale
    return segments.join("/") || `/${target}`;
  };

  return (
    <div className="locale-switcher" role="group" aria-label="Language">
      {locales.map((l) => (
        <Link
          key={l}
          href={swap(l)}
          hrefLang={l}
          className={`locale-switcher__btn${
            l === locale ? " locale-switcher__btn--active" : ""
          }`}
          aria-current={l === locale ? "true" : undefined}
        >
          {l.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
