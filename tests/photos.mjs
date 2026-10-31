import assert from "node:assert/strict";
import sharp from "sharp";
const base = process.env.TEST_BASE_URL || "http://localhost:3118";
const auth = await fetch(base + "/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: `${crypto.randomUUID()}@test.com`,
    password: "password123",
    name: "사진검증",
  }),
});
assert.equal(auth.status, 201);
const cookie = auth.headers.get("set-cookie").split(";")[0];
const photo = await sharp({
  create: { width: 80, height: 60, channels: 3, background: "#ff6f0f" },
})
  .png()
  .toBuffer();
function form(bytes, type = "image/png") {
  const data = new FormData();
  data.set("title", "사진 테스트");
  data.set("price", "1000");
  data.set("location", "서초동");
  data.set("photo", new Blob([bytes], { type }), "test.png");
  return data;
}
const post = (data, session = cookie) =>
  fetch(base + "/api/items", {
    method: "POST",
    headers: session ? { cookie: session } : {},
    body: data,
  });
assert.equal((await post(form(photo), "")).status, 401);
assert.equal((await post(form(Buffer.from("not an image")))).status, 400);
assert.equal(
  (await post(form(new Uint8Array(5 * 1024 * 1024 + 1)))).status,
  400,
);
const r = await post(form(photo));
assert.equal(r.status, 201);
const item = await r.json();
assert.equal(item.has_photo, 1);
const image = await fetch(`${base}/api/items/${item.id}/image`);
assert.equal(image.status, 200);
assert.equal(image.headers.get("content-type"), "image/webp");
const metadata = await sharp(Buffer.from(await image.arrayBuffer())).metadata();
assert.equal(metadata.width, 80);
assert.equal(metadata.format, "webp");
assert.equal(
  (await fetch(`${base}/api/items/${item.id}`).then((r) => r.json())).has_photo,
  1,
);
const optimized = await fetch(
  `${base}/_next/image?url=${encodeURIComponent(`/api/items/${item.id}/image`)}&w=640&q=75`,
);
assert.equal(optimized.status, 200);
assert.ok(optimized.headers.get("content-type").startsWith("image/"));
console.log(
  "PASS: 사진 등록/조회/WebP 변환, 비로그인·위장 파일·초과 크기 거부",
);
