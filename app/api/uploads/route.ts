import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";

const uploadsDirectory = path.join(process.cwd(), "public", "uploads");
// Stays under the 10MB body buffer of the proxy, which now guards this route.
const maxSize = 9 * 1024 * 1024;
const maxDimension = 2000;
// The format is read from the file content, not the browser-declared MIME type (unreliable).
// Raster images are re-encoded in sRGB: iPhone HDR photos (Display P3 + PQ gain map) otherwise look washed out in browsers.
const extensionByFormat: Record<string, string> = { jpeg: "jpg", png: "png", webp: "webp", gif: "gif", svg: "svg" };
const rasterExtensions = new Set(["jpg", "png", "webp"]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
    if (file.size > maxSize) return NextResponse.json({ error: "L'image dépasse 9 Mo." }, { status: 400 });

    const input = Buffer.from(await file.arrayBuffer());
    const format = (await sharp(input).metadata().catch(() => null))?.format;
    if (format === "heif") return NextResponse.json({ error: "Le format HEIC n'est pas supporté : exporte la photo en JPEG." }, { status: 400 });
    const extension = format ? extensionByFormat[format] : undefined;
    if (!extension) return NextResponse.json({ error: "Seules les images JPEG, PNG, WebP, GIF et SVG sont acceptées." }, { status: 400 });

    await fs.mkdir(uploadsDirectory, { recursive: true });
    const filename = `${randomUUID()}.${extension}`;
    const buffer = rasterExtensions.has(extension) ? await toSrgb(input, extension) : input;
    await fs.writeFile(path.join(uploadsDirectory, filename), buffer);
    return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Impossible d'envoyer l'image." }, { status: 500 });
  }
}

function toSrgb(input: Buffer, extension: string) {
  const image = sharp(input)
    .rotate()
    .resize({ width: maxDimension, height: maxDimension, fit: "inside", withoutEnlargement: true })
    .toColorspace("srgb")
    .withIccProfile("srgb");
  if (extension === "png") return image.png().toBuffer();
  if (extension === "webp") return image.webp({ quality: 85 }).toBuffer();
  return image.jpeg({ quality: 85, mozjpeg: true }).toBuffer();
}
