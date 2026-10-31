import { createHash } from "node:crypto";
import { z } from "zod";
import {
  db,
  user,
  failure,
  sameOrigin,
  credentials,
  body,
  hash,
  matches,
  session,
} from "@/lib/server";
export async function GET(req: Request) {
  return Response.json({ user: user(req) });
}
export async function POST(
  req: Request,
  ctx: { params: Promise<{ action: string }> },
) {
  if (!sameOrigin(req)) return failure("허용되지 않는 요청입니다.", 403);
  const { action } = await ctx.params;
  if (action === "logout") {
    const token = req.headers
      .get("cookie")
      ?.split(";")
      .map((v) => v.trim())
      .find((v) => v.startsWith("session="))
      ?.slice(8);
    if (token)
      db.prepare("DELETE FROM sessions WHERE token=?").run(
        createHash("sha256").update(token).digest("hex"),
      );
    return Response.json(
      { ok: true },
      {
        headers: {
          "Set-Cookie": "session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0",
        },
      },
    );
  }
  if (action !== "login" && action !== "register")
    return failure("찾을 수 없어요.", 404);
  const input = (
    action === "register"
      ? credentials.extend({ name: z.string().trim().min(1).max(30) })
      : credentials
  ).safeParse(await body(req));
  if (!input.success)
    return failure("이메일과 비밀번호(8자 이상)를 확인해주세요.");
  const data = input.data;
  if (action === "register") {
    if (db.prepare("SELECT id FROM users WHERE email=?").get(data.email))
      return failure("이미 가입한 이메일입니다.", 409);
    const name =
      "name" in data && typeof data.name === "string" ? data.name : "";
    const result = db
      .prepare("INSERT INTO users(email,name,password) VALUES(?,?,?)")
      .run(data.email, name, hash(data.password));
    return Response.json(
      { user: { id: Number(result.lastInsertRowid), name, email: data.email } },
      {
        status: 201,
        headers: { "Set-Cookie": session(result.lastInsertRowid) },
      },
    );
  }
  const found = db.prepare("SELECT * FROM users WHERE email=?").get(data.email);
  if (
    !found ||
    typeof found.password !== "string" ||
    !matches(data.password, found.password)
  )
    return failure("이메일 또는 비밀번호가 맞지 않아요.", 401);
  return Response.json(
    { user: { id: found.id, name: found.name, email: found.email } },
    { headers: { "Set-Cookie": session(Number(found.id)) } },
  );
}
