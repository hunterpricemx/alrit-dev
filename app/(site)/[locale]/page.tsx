import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionaryAsync } from "@/lib/i18n";
import { getPricingAsync } from "@/lib/content/pricing";
import { getSlotMap } from "@/lib/content/media";
import { getAllProjectsAsync } from "@/lib/content/portfolio";
import { getLogosAsync } from "@/lib/content/logos";
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
  const [dict, pricing, slotMap, projects, brandLogos, techLogos] = await Promise.all([
    getDictionaryAsync(l),
    getPricingAsync(),
    getSlotMap(),
    getAllProjectsAsync(),
    getLogosAsync("BRAND"),
    getLogosAsync("TECH"),
  ]);

  return (
    <>
      <MagneticHero dict={dict} locale={l} slotMap={slotMap} />
      <Services dict={dict} locale={l} slotMap={slotMap} logos={brandLogos} />
      <Calculator dict={dict} pricing={pricing} slotMap={slotMap} />
      <Portfolio dict={dict} locale={l} projects={projects} />
      <Process dict={dict} />
      <Results dict={dict} />
      <Technologies dict={dict} techLogos={techLogos} />
      <FinalCta dict={dict} locale={l} />
    </>
  );
}
