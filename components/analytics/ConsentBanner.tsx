"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const KEY = "alrit-consent";

export default function ConsentBanner({ enabled }: { enabled: boolean }) {
  const [show, setShow] = useState(false);
  const params = useParams();
  const en = (params?.locale as string) === "en";

  useEffect(() => {
    if (!enabled) return;
    try {
      // Sincroniza con localStorage al montar: muestra el banner solo si no hay decisión previa.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* localStorage no disponible */
    }
  }, [enabled]);

  const decide = (granted: boolean) => {
    try {
      localStorage.setItem(KEY, granted ? "granted" : "denied");
    } catch {
      /* noop */
    }
    const w = window as unknown as { gtag?: (...x: unknown[]) => void };
    const v = granted ? "granted" : "denied";
    w.gtag?.("consent", "update", {
      ad_storage: v,
      analytics_storage: v,
      ad_user_data: v,
      ad_personalization: v,
    });
    setShow(false);
  };

  if (!enabled || !show) return null;

  return (
    <div className="consent" role="dialog" aria-live="polite" aria-label={en ? "Cookie consent" : "Consentimiento de cookies"}>
      <p className="consent__text">
        {en
          ? "We use analytics cookies to improve the site. You can accept or decline."
          : "Usamos cookies de analítica para mejorar el sitio. Puedes aceptar o rechazar."}
      </p>
      <div className="consent__actions">
        <button type="button" className="consent__btn consent__btn--ghost" onClick={() => decide(false)}>
          {en ? "Decline" : "Rechazar"}
        </button>
        <button type="button" className="consent__btn" onClick={() => decide(true)}>
          {en ? "Accept" : "Aceptar"}
        </button>
      </div>
    </div>
  );
}
