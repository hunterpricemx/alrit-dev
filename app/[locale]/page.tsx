import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n";
import { notFound } from "next/navigation";
import MagneticHero from "@/components/hero/MagneticHero";
import SocialProof from "@/components/sections/SocialProof";
import Services from "@/components/sections/Services";
import Calculator from "@/components/sections/Calculator";
import Portfolio from "@/components/sections/Portfolio";
import Process from "@/components/sections/Process";
import Testimonials from "@/components/sections/Testimonials";
import FinalCta from "@/components/sections/FinalCta";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l = locale as Locale;
  const dict = getDictionary(l);

  return (
    <>
      <MagneticHero dict={dict} locale={l} />
      <SocialProof dict={dict} />
      <Services dict={dict} locale={l} />
      <Calculator dict={dict} />
      <Portfolio dict={dict} />
      <Process dict={dict} />
      <Testimonials dict={dict} />
      <FinalCta dict={dict} locale={l} />
    </>
  );
}
