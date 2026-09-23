import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const uploadsDirectory = path.join(process.cwd(), "public", "uploads");
const maxSize = 5 * 1024 * 1024;
const extensionByType: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Seules les images sont acceptées." }, { status: 400 });
    if (file.size > maxSize) return NextResponse.json({ error: "L'image dépasse 5 Mo." }, { status: 400 });
    const extension = extensionByType[file.type] || path.extname(file.name).replace(".", "").toLowerCase() || "bin";
    if (!/^[a-z0-9]{2,5}$/.test(extension)) return NextResponse.json({ error: "Format d'image non reconnu." }, { status: 400 });

    await fs.mkdir(uploadsDirectory, { recursive: true });
    const filename = `${randomUUID()}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(uploadsDirectory, filename), buffer);
    return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Impossible d'envoyer l'image." }, { status: 500 });
  }
}
