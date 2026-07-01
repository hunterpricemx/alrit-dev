"use client";

import { useState } from "react";
import { submitQuote } from "@/app/(site)/[locale]/_actions/quote";

export type ContactLabels = {
  name: string;
  email: string;
  phone: string;
  message: string;
  submit: string;
  sending: string;
  ok: string;
  error: string;
};

/** Formulario de contacto público. Reusa submitQuote → cae en /admin/cotizaciones. */
export default function ContactForm({ labels }: { labels: ContactLabels }) {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const field =
    "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const res = await submitQuote({
      name: form.name,
      email: form.email,
      phone: form.phone,
      brief: form.message,
      projectType: "contacto",
      extras: [],
      amount: null,
      custom: true,
    });
    if (res.ok) {
      setStatus("ok");
      setForm({ name: "", email: "", phone: "", message: "" });
    } else {
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800">
        {labels.ok}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <input
        required
        className={field}
        placeholder={labels.name}
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        required
        type="email"
        className={field}
        placeholder={labels.email}
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        className={field}
        placeholder={labels.phone}
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />
      <textarea
        required
        rows={5}
        className={field}
        placeholder={labels.message}
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-xl bg-stone-900 px-6 py-3 font-semibold text-white transition hover:bg-stone-700 disabled:opacity-60"
      >
        {status === "sending" ? labels.sending : labels.submit}
      </button>
      {status === "error" && <p className="text-red-600">{labels.error}</p>}
    </form>
  );
}
