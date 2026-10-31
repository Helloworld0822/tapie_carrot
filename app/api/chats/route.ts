import { z } from "zod";
import { db, user, failure, sameOrigin, body } from "@/lib/server";
export async function GET(req: Request) {
  const u = user(req);
  if (!u) return failure("로그인이 필요해요.", 401);
  return Response.json(
    db
      .prepare(
        `SELECT chats.*,items.title,users.name AS partner_name,(SELECT text FROM messages WHERE chat_id=chats.id ORDER BY id DESC LIMIT 1) AS last_message FROM chats JOIN items ON items.id=chats.item_id JOIN users ON users.id=CASE WHEN buyer_id=? THEN chats.seller_id ELSE chats.buyer_id END WHERE buyer_id=? OR chats.seller_id=? ORDER BY chats.id DESC`,
      )
      .all(u.id, u.id, u.id),
  );
}
export async function POST(req: Request) {
  if (!sameOrigin(req)) return failure("허용되지 않는 요청입니다.", 403);
  const u = user(req);
  if (!u) return failure("로그인이 필요해요.", 401);
  const input = z
    .object({ itemId: z.number().int().positive() })
    .safeParse(await body(req));
  if (!input.success) return failure("상품을 확인해주세요.");
  const item = db
    .prepare("SELECT * FROM items WHERE id=?")
    .get(input.data.itemId);
  if (!item) return failure("상품을 찾을 수 없어요.", 404);
  if (!item.seller_id) return failure("판매자 정보가 없는 예시 상품입니다.");
  if (item.seller_id === u.id)
    return failure("내 상품에는 채팅을 시작할 수 없어요.");
  db.prepare(
    "INSERT OR IGNORE INTO chats(item_id,buyer_id,seller_id) VALUES(?,?,?)",
  ).run(item.id, u.id, item.seller_id);
  return Response.json(
    db
      .prepare("SELECT * FROM chats WHERE item_id=? AND buyer_id=?")
      .get(item.id, u.id),
    { status: 201 },
  );
}
