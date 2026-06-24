"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });
    setLoading(false);
    if (!res || res.error) {
      setError("Credenciales inválidas.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="adm-login">
      <form className="adm-login__card" onSubmit={onSubmit}>
        <h1 className="adm-login__brand">
          Alrit<span>.dev</span>
        </h1>
        <p className="adm-login__sub">Panel de administración</p>

        <div className="adm-login__field">
          <label className="adm-login__label" htmlFor="email">Email</label>
          <input className="adm-input" id="email" name="email" type="email" autoComplete="username" required />
        </div>
        <div className="adm-login__field">
          <label className="adm-login__label" htmlFor="password">Contraseña</label>
          <input className="adm-input" id="password" name="password" type="password" autoComplete="current-password" required />
        </div>

        {error && <p className="adm-err">{error}</p>}

        <button className="adm-btn" type="submit" disabled={loading}>
          {loading ? "Entrando…" : "Iniciar sesión"}
        </button>
      </form>
    </main>
  );
}
