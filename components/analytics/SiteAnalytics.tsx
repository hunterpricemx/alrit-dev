"use client";

import Script from "next/script";
import { useEffect } from "react";

/**
 * GA4 con Consent Mode v2 (todo denegado por defecto hasta que el usuario acepte).
 * Inerte si `gaId` está vacío (se configura en /admin/configuracion).
 * Además rastrea por delegación los clics de contacto (WhatsApp / email).
 */
export default function SiteAnalytics({ gaId }: { gaId: string }) {
  const GA_ID = gaId;
  useEffect(() => {
    if (!GA_ID) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const a = target?.closest?.("a") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      const w = window as unknown as { gtag?: (...x: unknown[]) => void };
      if (href.includes("wa.me") || href.includes("api.whatsapp.com")) {
        w.gtag?.("event", "contact", { method: "whatsapp" });
      } else if (href.startsWith("mailto:")) {
        w.gtag?.("event", "contact", { method: "email" });
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [GA_ID]);

  if (!GA_ID) return null;

  return (
    <>
      <Script id="ga-init" strategy="afterInteractive">
        {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('consent','default',{ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});
        try{ if(localStorage.getItem('alrit-consent')==='granted'){ gtag('consent','update',{ad_storage:'granted',analytics_storage:'granted',ad_user_data:'granted',ad_personalization:'granted'}); } }catch(e){}
        gtag('js', new Date());
        gtag('config','${GA_ID}',{ anonymize_ip:true });
        `}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
    </>
  );
}
