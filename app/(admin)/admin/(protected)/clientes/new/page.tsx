import NewClientForm from "../_newform";

export const dynamic = "force-dynamic";

export default function NewClientPage() {
  return (
    <>
      <header className="adm__head">
        <h1 className="adm__title">Nuevo cliente</h1>
        <p className="adm__subtitle">Crea la cuenta del cliente y su primer proyecto.</p>
      </header>
      <NewClientForm />
    </>
  );
}
