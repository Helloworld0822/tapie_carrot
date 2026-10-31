import { db, failure } from "@/lib/server";
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const row = db
    .prepare("SELECT data FROM item_photos WHERE item_id=?")
    .get(id);
  if (!row || !(row.data instanceof Uint8Array))
    return failure("사진을 찾을 수 없어요.", 404);
  return new Response(Buffer.from(row.data), {
    headers: {
      "Content-Type": "image/webp",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
