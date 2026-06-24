import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "../globals.css";
import "../admin-x.css";

const poppins = Poppins({
  variable: "--font-display",
  weight: ["600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Admin · Alrit.dev",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${poppins.variable} ${inter.variable} h-full antialiased`}>
      <body className="adm-body">{children}</body>
    </html>
  );
}
