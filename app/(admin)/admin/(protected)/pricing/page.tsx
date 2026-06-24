import { getDictionary } from "@/lib/i18n";
import { getPricingAsync } from "@/lib/content/pricing";
import { EXTRA_IDS } from "@/lib/pricing";
import PricingForm from "./_form";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const pricing = await getPricingAsync();
  const t = getDictionary("es").calculator;

  const typeLabels: Record<string, string> = Object.fromEntries(
    pricing.types.map((pt) => [pt.id, t.types[pt.id]?.name ?? pt.id]),
  );
  const extraLabels: Record<string, string> = Object.fromEntries(
    EXTRA_IDS.map((id) => [id, t.extras[id] ?? id]),
  );

  return (
    <>
      <header className="adm__head">
        <h1 className="adm__title">Precios</h1>
        <p className="adm__subtitle">
          Edita los precios base y tiempos. Los cambios se reflejan en la calculadora del sitio.
        </p>
      </header>
      <PricingForm pricing={pricing} typeLabels={typeLabels} extraLabels={extraLabels} />
    </>
  );
}
