"use client";

import Script from "next/script";
import { useEffect } from "react";
import type { SiteScripts } from "@/lib/content/scripts";

/** Inserta HTML crudo re-creando los <script> para que SÍ se ejecuten. */
function injectRaw(target: HTMLElement, html: string) {
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  tpl.content.querySelectorAll("script").forEach((old) => {
    const s = document.createElement("script");
    for (const a of Array.from(old.attributes)) s.setAttribute(a.name, a.value);
    s.textContent = old.textContent;
    old.replaceWith(s);
  });
  target.appendChild(tpl.content);
}

/**
 * Etiquetas de marketing configurables desde el admin: Google Tag Manager,
 * Meta Pixel y código libre en <head>/<body>. La verificación de buscadores
 * se inyecta como meta en el <head> vía la Metadata API (ver layout).
 */
export default function SiteScripts({ scripts }: { scripts: SiteScripts }) {
  const { gtmId, metaPixelId, headScripts, bodyScripts } = scripts;

  useEffect(() => {
    if (headScripts) injectRaw(document.head, headScripts);
    if (bodyScripts) injectRaw(document.body, bodyScripts);
    // Solo al montar: es contenido controlado por el admin.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {gtmId && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
        </Script>
      )}
      {metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');`}
        </Script>
      )}
      {(gtmId || metaPixelId) && (
        <noscript>
          {gtmId && (
            <iframe
              title="gtm"
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          )}
          {metaPixelId && (
            // eslint-disable-next-line @next/next/no-img-element
            <img height="1" width="1" style={{ display: "none" }} alt="" src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`} />
          )}
        </noscript>
      )}
    </>
  );
}
