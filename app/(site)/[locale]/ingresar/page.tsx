import type { Metadata } from "next";
import LoginForm from "./_form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Iniciar sesión",
    robots: { index: false, follow: true },
    alternates: { canonical: `/${locale}/ingresar` },
  };
}

export default function LoginPage() {
  return <LoginForm />;
}
