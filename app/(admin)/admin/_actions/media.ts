"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { deleteObject } from "@/lib/storage/s3";

async function guard() {
  const session = await auth();
  if (!session) throw new Error("No autorizado");
}

function revalidateSite() {
  // Las imágenes aparecen en todo el sitio (layout incluido).
  revalidatePath("/[locale]", "layout");
}

export async function assignSlot(slot: string, mediaId: string) {
  await guard();
  await db.mediaSlot.upsert({
    where: { slot },
    create: { slot, mediaId },
    update: { mediaId },
  });
  revalidateSite();
}

export async function clearSlot(slot: string) {
  await guard();
  await db.mediaSlot.deleteMany({ where: { slot } });
  revalidateSite();
}

export async function deleteMedia(id: string): Promise<{ ok: boolean; error?: string }> {
  await guard();
  const inUse = await db.mediaSlot.count({ where: { mediaId: id } });
  if (inUse > 0) return { ok: false, error: "La imagen está asignada a un slot. Quítala primero." };
  const media = await db.media.findUnique({ where: { id } });
  if (media) {
    try {
      await deleteObject(media.objectKey);
    } catch {
      // si falla el borrado en MinIO, igual quitamos el registro
    }
    await db.media.delete({ where: { id } });
  }
  revalidateSite();
  return { ok: true };
}
