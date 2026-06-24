"use client";

import { SessionProvider } from "next-auth/react";

// Provee la sesión a componentes cliente (Header) sin volver dinámicas las
// páginas: la sesión se resuelve en el cliente vía /api/auth/session.
export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
