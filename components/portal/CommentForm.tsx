"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addProjectComment } from "@/app/(site)/[locale]/_actions/portal";

export default function CommentForm({
  projectId,
  locale,
  placeholder,
  send,
}: {
  projectId: string;
  locale: string;
  placeholder: string;
  send: string;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    await addProjectComment(projectId, body, locale);
    setBody("");
    setBusy(false);
    router.refresh();
  }

  return (
    <form className="portal-form" onSubmit={onSubmit}>
      <textarea className="portal-input" rows={2} placeholder={placeholder} value={body} onChange={(e) => setBody(e.target.value)} />
      <button className="portal-btn" type="submit" disabled={busy}>{send}</button>
    </form>
  );
}
