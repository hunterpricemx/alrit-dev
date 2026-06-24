"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { registerStudent } from "../_actions/auth";

export default function RegisterPage() {
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
    const input = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      password: String(fd.get("password") ?? ""),
    };
    const res = await registerStudent(input);
    if (!res.ok) {
      setError(res.error ?? "No se pudo crear la cuenta.");
      setLoading(false);
      return;
    }
    const s = await signIn("credentials", {
      email: input.email.trim().toLowerCase(),
      password: input.password,
      redirect: false,
    });
    setLoading(false);
    if (!s || s.error) {
      setError("Cuenta creada. Inicia sesión para continuar.");
      return;
    }
    router.push(`/${locale}/cuenta`);
    router.refresh();
  }

  return (
    <main className="auth">
      <form className="auth__card" onSubmit={onSubmit}>
        <h1 className="auth__title">Crear cuenta</h1>
        <p className="auth__sub">Regístrate para acceder a los cursos.</p>

        <label className="auth__field">
          <span>Nombre</span>
          <input className="auth__input" name="name" autoComplete="name" required />
        </label>
        <label className="auth__field">
          <span>Email</span>
          <input className="auth__input" name="email" type="email" autoComplete="email" required />
        </label>
        <label className="auth__field">
          <span>Contraseña</span>
          <input className="auth__input" name="password" type="password" autoComplete="new-password" minLength={8} required />
        </label>

        {error && <p className="auth__err">{error}</p>}

        <button className="auth__btn" type="submit" disabled={loading}>
          {loading ? "Creando…" : "Crear cuenta"}
        </button>
        <p className="auth__alt">
          ¿Ya tienes cuenta? <Link href={`/${locale}/ingresar`}>Inicia sesión</Link>
        </p>
      </form>
    </main>
  );
}
