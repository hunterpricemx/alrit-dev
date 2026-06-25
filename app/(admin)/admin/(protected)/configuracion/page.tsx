import { getSettingsAsync } from "@/lib/content/settings";
import SettingsForm from "./_form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettingsAsync();
  return (
    <>
      <header className="adm__head">
        <h1 className="adm__title">Configuración</h1>
        <p className="adm__subtitle">Contacto, redes, analítica y dirección. Alimentan el sitio, el footer y los datos estructurados (SEO).</p>
      </header>
      <SettingsForm initial={settings} />
    </>
  );
}
