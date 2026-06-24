import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionaryAsync } from "@/lib/i18n";
import { getPricingAsync } from "@/lib/content/pricing";
import { getSlotMap } from "@/lib/content/media";
import { notFound } from "next/navigation";
import MagneticHero from "@/components/hero/MagneticHero";
import Services from "@/components/sections/Services";
import Calculator from "@/components/sections/Calculator";
import Portfolio from "@/components/sections/Portfolio";
import Process from "@/components/sections/Process";
import Results from "@/components/sections/Results";
import Technologies from "@/components/sections/Technologies";
import FinalCta from "@/components/sections/FinalCta";

// ISR: contenido editable desde el admin; revalida en background y on-demand.
export const revalidate = 3600;

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l = locale as Locale;
  const [dict, pricing, slotMap] = await Promise.all([
    getDictionaryAsync(l),
    getPricingAsync(),
    getSlotMap(),
  ]);

  return (
    <>
      <MagneticHero dict={dict} locale={l} slotMap={slotMap} />
      <Services dict={dict} locale={l} slotMap={slotMap} />
      <Calculator dict={dict} pricing={pricing} slotMap={slotMap} />
      <Portfolio dict={dict} locale={l} />
      <Process dict={dict} />
      <Results dict={dict} />
      <Technologies dict={dict} slotMap={slotMap} />
      <FinalCta dict={dict} locale={l} />
    </>
  );
}
