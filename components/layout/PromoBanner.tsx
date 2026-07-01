import { isPromoActive } from "@/lib/pricing";
import type { Dictionary } from "@/lib/i18n";

/** Cinta de precios de temporada. Se oculta sola cuando termina la promo (PROMO_ENDS_AT). */
export default function PromoBanner({ dict }: { dict: Dictionary }) {
  if (!isPromoActive()) return null;
  return (
    <div className="bg-linear-to-r from-[#ff8a3d] via-[#ff4d8d] to-[#8a6bff] px-4 py-2 text-center text-[13px] font-medium leading-snug text-white">
      <span aria-hidden="true">🔥 </span>
      {dict.promo.text}
    </div>
  );
}
