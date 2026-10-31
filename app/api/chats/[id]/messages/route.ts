import { z } from "zod";
import { db, user, failure, sameOrigin, body } from "@/lib/server";
async function access(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const u = user(req);
  if (!u) return { error: failure("로그인이 필요해요.", 401) };
  const { id } = await ctx.params;
  const chat = db
    .prepare("SELECT id FROM chats WHERE id=? AND (buyer_id=? OR seller_id=?)")
    .get(id, u.id, u.id);
  return chat ? { u, id } : { error: failure("채팅을 찾을 수 없어요.", 404) };
}
export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const a = await access(req, ctx);
  if (a.error) return a.error;
  const after = Number(new URL(req.url).searchParams.get("after") || 0);
  if (!Number.isSafeInteger(after) || after < 0)
    return failure("잘못된 메시지 번호입니다.");
  return Response.json(
    db
      .prepare(
        "SELECT id,sender_id,text,created_at FROM messages WHERE chat_id=? AND id>? ORDER BY id LIMIT 100",
      )
      .all(a.id, after),
  );
}
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!sameOrigin(req)) return failure("허용되지 않는 요청입니다.", 403);
  const a = await access(req, ctx);
  if (a.error) return a.error;
  const input = z
    .object({ text: z.string().trim().min(1).max(2000) })
    .safeParse(await body(req));
  if (!input.success) return failure("메시지는 1~2000자로 입력해주세요.");
  const result = db
    .prepare("INSERT INTO messages(chat_id,sender_id,text) VALUES(?,?,?)")
    .run(a.id, a.u.id, input.data.text);
  return Response.json(
    db.prepare("SELECT * FROM messages WHERE id=?").get(result.lastInsertRowid),
    { status: 201 },
  );
}
