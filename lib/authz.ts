import { auth } from "@/auth";

/** Extrae el rol de la sesión (Auth.js lo propaga en session.user.role). */
export function roleOf(session: unknown): string | undefined {
  return (session as { user?: { role?: string } } | null | undefined)?.user?.role;
}

/** Lanza si el usuario no es ADMIN. Úsalo al inicio de cada server action / route handler del admin. */
export async function requireAdmin(): Promise<void> {
  const session = await auth();
  if (roleOf(session) !== "ADMIN") throw new Error("No autorizado");
}

export async function isAdmin(): Promise<boolean> {
  return roleOf(await auth()) === "ADMIN";
}
