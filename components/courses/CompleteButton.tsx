"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { markLessonComplete } from "@/app/(site)/[locale]/_actions/enroll";

export default function CompleteButton({
  lessonId,
  locale,
  completed,
  completeLabel,
  completedLabel,
}: {
  lessonId: string;
  locale: string;
  completed: boolean;
  completeLabel: string;
  completedLabel: string;
}) {
  const router = useRouter();
  const [done, setDone] = useState(completed);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const next = !done;
    await markLessonComplete(lessonId, next, locale);
    setDone(next);
    setBusy(false);
    router.refresh();
  }

  return (
    <button type="button" className={`lms-complete${done ? " is-done" : ""}`} onClick={toggle} disabled={busy}>
      {done ? completedLabel : completeLabel}
    </button>
  );
}
