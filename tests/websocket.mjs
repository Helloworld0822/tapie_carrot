import assert from "node:assert/strict";
import { WebSocket } from "ws";
const base = process.env.TEST_BASE_URL || "http://localhost:3105";
async function post(path, data, cookie) {
  const r = await fetch(base + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(data),
  });
  assert.ok(r.ok);
  return {
    data: await r.json(),
    cookie: r.headers.get("set-cookie")?.split(";")[0],
  };
}
const unique = crypto.randomUUID();
const seller = await post("/api/auth/register", {
  email: `s${unique}@test.com`,
  password: "password123",
  name: "판매자",
});
const buyer = await post("/api/auth/register", {
  email: `b${unique}@test.com`,
  password: "password123",
  name: "구매자",
});
const item = await post(
  "/api/items",
  { title: "웹소켓 테스트", price: 100, location: "서초동" },
  seller.cookie,
);
const chat = await post("/api/chats", { itemId: item.data.id }, buyer.cookie);
function connect(cookie) {
  return new WebSocket(
    base.replace("http", "ws") + `/ws/chat?chatId=${chat.data.id}`,
    { headers: { Origin: base, ...(cookie ? { Cookie: cookie } : {}) } },
  );
}
function receive(ws) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("message timeout")), 5000);
    ws.once("message", (raw) => {
      clearTimeout(timer);
      resolve(JSON.parse(raw.toString()));
    });
    ws.once("error", reject);
  });
}
const a = connect(seller.cookie),
  b = connect(buyer.cookie);
try {
  assert.equal((await receive(a)).type, "history");
  assert.equal((await receive(b)).type, "history");
  const receivedA = receive(a),
    receivedB = receive(b);
  b.send(JSON.stringify({ text: "실시간 문의" }));
  assert.equal((await receivedA).message.text, "실시간 문의");
  assert.equal((await receivedB).message.text, "실시간 문의");
  const rows = await fetch(`${base}/api/chats/${chat.data.id}/messages`, {
    headers: { Cookie: seller.cookie },
  }).then((r) => r.json());
  assert.equal(rows[0].text, "실시간 문의");
  const rejected = connect();
  await new Promise((resolve, reject) => {
    rejected.once("error", resolve);
    rejected.once("open", () => reject(new Error("anonymous connected")));
  });
  const malformed = new WebSocket(
    base.replace("http", "ws") + `/ws/chat?chatId=${chat.data.id}`,
    { headers: { Origin: "not-a-url", Cookie: seller.cookie } },
  );
  await new Promise((resolve, reject) => {
    malformed.once("error", resolve);
    malformed.once("open", () =>
      reject(new Error("malformed Origin accepted")),
    );
  });
  assert.equal(
    (await fetch(base + "/api/auth/me", { headers: { Cookie: seller.cookie } }))
      .status,
    200,
  );
  const invalid = receive(b);
  b.send("null");
  assert.equal((await invalid).type, "error");
  console.log("PASS: WebSocket 양방향 전달, DB 저장, 비로그인 연결 차단");
} finally {
  a.close();
  b.close();
}
