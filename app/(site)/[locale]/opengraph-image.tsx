import { ImageResponse } from "next/og";

export const alt = "Alrit.dev — Desarrollo web que convierte";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Imagen Open Graph de marca generada en build (sin assets externos).
export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "90px",
          background: "#0f0f14",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: "240px",
            height: "12px",
            borderRadius: "999px",
            marginBottom: "44px",
            backgroundImage: "linear-gradient(90deg, #ff8a3d, #ff4d8d 45%, #8a6bff)",
          }}
        />
        <div style={{ display: "flex", fontSize: "118px", fontWeight: 800, letterSpacing: "-3px" }}>
          <span>Alrit</span>
          <span style={{ color: "#ff4d8d" }}>.dev</span>
        </div>
        <div style={{ fontSize: "42px", color: "#a1a1aa", marginTop: "28px", maxWidth: "900px" }}>
          Construimos el sitio que tu negocio merece.
        </div>
        <div style={{ fontSize: "30px", color: "#71717a", marginTop: "56px" }}>
          Desarrollo web - E-commerce - Sistemas a medida - SEO
        </div>
      </div>
    ),
    { ...size },
  );
}
