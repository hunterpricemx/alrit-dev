"use client";

import { useRouter } from "next/navigation";
import { setQuoteStatus, deleteQuote } from "../../_actions/quotes";

type Quote = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  brief: string | null;
  type: string;
  extras: string[];
  amount: string;
  status: string;
  date: string;
};

const STATUSES = ["NEW", "CONTACTED", "CLOSED"] as const;
const STATUS_LABEL: Record<string, string> = { NEW: "Nuevo", CONTACTED: "Contactado", CLOSED: "Cerrado" };

export default function QuotesList({ quotes }: { quotes: Quote[] }) {
  const router = useRouter();
  const refresh = () => router.refresh();

  if (quotes.length === 0) {
    return <div className="adm-panel"><p className="adm-row__hint">Aún no hay cotizaciones.</p></div>;
  }

  return (
    <div className="adm-quotes">
      {quotes.map((q) => (
        <div className="adm-panel adm-quote" key={q.id}>
          <div className="adm-quote__top">
            <div>
              <span className="adm-quote__name">{q.name}</span>
              <span className={`adm-quote__badge adm-quote__badge--${q.status}`}>{STATUS_LABEL[q.status]}</span>
            </div>
            <span className="adm-quote__date">{q.date}</span>
          </div>
          <p className="adm-quote__contact">
            <a href={`mailto:${q.email}`}>{q.email}</a>{q.phone ? ` · ${q.phone}` : ""}
          </p>
          <p className="adm-quote__project">
            <strong>{q.type}</strong>{q.extras.length > 0 ? ` + ${q.extras.join(", ")}` : ""} · <strong>{q.amount}</strong>
          </p>
          {q.brief && <p className="adm-quote__brief">{q.brief}</p>}
          <div className="adm-quote__actions">
            <select className="adm-input" value={q.status} onChange={(e) => setQuoteStatus(q.id, e.target.value as "NEW" | "CONTACTED" | "CLOSED").then(refresh)}>
              {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
            <button type="button" className="adm-danger__btn" onClick={() => deleteQuote(q.id).then(refresh)}>Eliminar</button>
          </div>
        </div>
      ))}
    </div>
  );
}
