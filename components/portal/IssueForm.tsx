"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createIssue } from "@/app/(site)/[locale]/_actions/portal";

export default function IssueForm({
  projectId,
  locale,
  labels,
}: {
  projectId: string;
  locale: string;
  labels: {
    newIssue: string;
    issueTitle: string;
    issueDesc: string;
    create: string;
    priority: string;
    priorityLabels: Record<string, string>;
  };
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const input = {
      title: String(fd.get("title") ?? ""),
      description: String(fd.get("description") ?? ""),
      priority: String(fd.get("priority") ?? "MEDIUM"),
    };
    if (!input.title.trim()) return;
    setBusy(true);
    await createIssue(projectId, input, locale);
    setBusy(false);
    form.reset();
    router.refresh();
  }

  return (
    <details className="portal-newissue">
      <summary className="portal-newissue__summary">{labels.newIssue}</summary>
      <form className="portal-form" onSubmit={onSubmit} style={{ marginTop: "0.75rem" }}>
        <input className="portal-input" name="title" placeholder={labels.issueTitle} />
        <textarea className="portal-input" name="description" rows={2} placeholder={labels.issueDesc} />
        <select className="portal-input" name="priority" defaultValue="MEDIUM" aria-label={labels.priority}>
          {["LOW", "MEDIUM", "HIGH"].map((p) => <option key={p} value={p}>{labels.priorityLabels[p]}</option>)}
        </select>
        <button className="portal-btn" type="submit" disabled={busy}>{labels.create}</button>
      </form>
    </details>
  );
}
