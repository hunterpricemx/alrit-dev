import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { putObject } from "@/lib/storage/s3";

export const runtime = "nodejs";

const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"]);
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Sin archivo" }, { status: 400 });
  if (!ALLOWED.has(file.type)) return NextResponse.json({ error: "Tipo de imagen no permitido" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "El archivo supera 8 MB" }, { status: 400 });

  const buf = Buffer.from(await file.arrayBuffer());

  let width: number | undefined;
  let height: number | undefined;
  if (file.type !== "image/svg+xml") {
    try {
      const sharp = (await import("sharp")).default;
      const meta = await sharp(buf).metadata();
      width = meta.width;
      height = meta.height;
    } catch {
      // sin metadatos no es crítico
    }
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `media/${crypto.randomUUID()}-${safeName}`;

  try {
    const url = await putObject(key, buf, file.type);
    const media = await db.media.create({
      data: { filename: file.name, objectKey: key, url, mime: file.type, bytes: file.size, width, height },
    });
    return NextResponse.json({ media });
  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json({ error: "No se pudo subir el archivo" }, { status: 500 });
  }
}
