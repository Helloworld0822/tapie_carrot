import { db, failure } from "@/lib/server";
export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const item = db
    .prepare(
      "SELECT items.*,users.name AS seller_name FROM items LEFT JOIN users ON users.id=items.seller_id WHERE items.id=?",
    )
    .get(id);
  return item ? Response.json(item) : failure("상품을 찾을 수 없어요.", 404);
}
