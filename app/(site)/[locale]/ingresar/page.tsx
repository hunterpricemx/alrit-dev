"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "es";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: String(fd.get("email") ?? "").trim().toLowerCase(),
      password: String(fd.get("password") ?? ""),
      redirect: false,
    });
    setLoading(false);
    if (!res || res.error) {
      setError("Credenciales inválidas.");
      return;
    }
    router.push(`/${locale}/cuenta`);
    router.refresh();
  }

  return (
    <main className="auth">
      <form className="auth__card" onSubmit={onSubmit}>
        <h1 className="auth__title">Iniciar sesión</h1>
        <p className="auth__sub">Accede a tus cursos.</p>

        <label className="auth__field">
          <span>Email</span>
          <input className="auth__input" name="email" type="email" autoComplete="email" required />
        </label>
        <label className="auth__field">
          <span>Contraseña</span>
          <input className="auth__input" name="password" type="password" autoComplete="current-password" required />
        </label>

        {error && <p className="auth__err">{error}</p>}

        <button className="auth__btn" type="submit" disabled={loading}>
          {loading ? "Entrando…" : "Iniciar sesión"}
        </button>
        <p className="auth__alt">
          ¿No tienes cuenta? <Link href={`/${locale}/registro`}>Regístrate</Link>
        </p>
      </form>
    </main>
  );
}
