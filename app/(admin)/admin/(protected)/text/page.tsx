import { getDictionary } from "@/lib/i18n";
import { db } from "@/lib/db";
import { safeQuery } from "@/lib/content/safe";
import { EDITABLE_KEYS, getByPath } from "@/lib/i18n/overrides";
import { locales } from "@/lib/i18n/config";
import TextForm from "./_form";

export const dynamic = "force-dynamic";

export default async function TextPage() {
  const rows = await safeQuery(() => db.textOverride.findMany(), []);
  const overrides: Record<string, string> = {};
  for (const r of rows) overrides[`${r.locale}__${r.key}`] = r.value;

  const base: Record<string, string> = {};
  for (const loc of locales) {
    const dict = getDictionary(loc);
    for (const { key } of EDITABLE_KEYS) base[`${loc}__${key}`] = getByPath(dict, key);
  }

  return (
    <>
      <header className="adm__head">
        <h1 className="adm__title">Textos</h1>
        <p className="adm__subtitle">
          Edita los textos clave del sitio (ES / EN). Deja un campo vacío para usar el texto por defecto.
        </p>
      </header>
      <TextForm fields={EDITABLE_KEYS} base={base} overrides={overrides} locales={[...locales]} />
    </>
  );
}
