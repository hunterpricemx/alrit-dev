"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { enroll } from "@/app/(site)/[locale]/_actions/enroll";

export default function EnrollButton({
  courseSlug,
  locale,
  label,
}: {
  courseSlug: string;
  locale: string;
  label: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    setBusy(true);
    const res = await enroll(courseSlug, locale);
    if (res.needLogin) {
      router.push(`/${locale}/ingresar`);
      return;
    }
    if (res.ok && res.firstLessonId) {
      router.push(`/${locale}/cursos/${courseSlug}/leccion/${res.firstLessonId}`);
      return;
    }
    setBusy(false);
  }

  return (
    <button type="button" className="lms-enroll" onClick={onClick} disabled={busy}>
      {busy ? "…" : label}
    </button>
  );
}
