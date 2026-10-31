import sharp from "sharp";
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export async function parseItemRequest(req: Request) {
  if (!req.headers.get("content-type")?.includes("multipart/form-data"))
    return { data: await req.json(), photo: null };
  // Bound the whole multipart body before parsing, including clients without Content-Length.
  const reader = req.body?.getReader();
  if (!reader) throw new Error("입력 내용이 없어요.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const part = await reader.read();
    if (part.done) break;
    size += part.value.length;
    if (size > MAX_PHOTO_BYTES + 65536) {
      await reader.cancel();
      throw new Error("사진은 5MB 이하로 등록해주세요.");
    }
    chunks.push(part.value);
  }
  const form = await new Response(Buffer.concat(chunks), {
    headers: { "Content-Type": req.headers.get("content-type") || "" },
  }).formData();
  const file = form.get("photo");
  let photo: Buffer | null = null;
  if (file instanceof File && file.size) {
    if (file.size > MAX_PHOTO_BYTES)
      throw new Error("사진은 5MB 이하로 등록해주세요.");
    const image = sharp(Buffer.from(await file.arrayBuffer()), {
      limitInputPixels: 25000000,
    });
    const metadata = await image.metadata();
    if (
      !["jpeg", "png", "webp"].includes(metadata.format || "") ||
      (metadata.pages || 1) > 1
    )
      throw new Error("JPEG, PNG, WebP 사진 한 장만 등록할 수 있어요.");
    photo = await image
      .rotate()
      .resize({
        width: 1800,
        height: 1800,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toBuffer();
  }
  return { data: Object.fromEntries(form), photo };
}
