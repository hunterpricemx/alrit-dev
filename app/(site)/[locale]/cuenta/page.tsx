import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { auth } from "@/auth";
import { FEATURES } from "@/lib/features";

export const dynamic = "force-dynamic";

// Enruta al panel correcto según el rol tras iniciar sesión.
export default async function CuentaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!role) redirect(`/${locale}/ingresar`);
  if (role === "ADMIN" || role === "EDITOR") redirect(`/admin`);
  if (role === "CLIENT") redirect(`/${locale}/portal`);
  // STUDENT: con el LMS oculto no hay panel de alumno → al home.
  redirect(FEATURES.lms ? `/${locale}/mi-aprendizaje` : `/${locale}`);
}
