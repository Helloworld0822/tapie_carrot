import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('carrot.sqlite');
db.exec(`CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, title TEXT NOT NULL, price INTEGER NOT NULL, location TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
if (!(db.prepare('SELECT COUNT(*) as count FROM items').get() as { count: number }).count) {
  const insert = db.prepare('INSERT INTO items (title, price, location, description) VALUES (?, ?, ?, ?)');
  insert.run('따뜻한 원목 사이드 테이블', 25000, '서초동', '깨끗하게 사용한 사이드 테이블이에요.');
  insert.run('편하게 입기 좋은 니트', 12000, '역삼동', '상태 좋아요. 동네에서 거래해요!');
  insert.run('작은 화분과 함께하는 초록 생활', 8000, '성수동', '잘 자라고 있는 식물입니다.');
  insert.run('주말에 읽기 좋은 책 나눔', 0, '망원동', '필요하신 분께 나눔해요.');
}
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get('q')?.trim() ?? '';
  return Response.json(db.prepare('SELECT * FROM items WHERE title LIKE ? OR location LIKE ? ORDER BY id DESC').all(`%${q}%`, `%${q}%`));
}
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const location = typeof body.location === 'string' ? body.location.trim() : '';
    const price = Number(body.price);
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    if (!title || title.length > 100 || !location || location.length > 50 || !Number.isSafeInteger(price) || price < 0 || description.length > 2000) return Response.json({ error: '입력 내용을 확인해주세요.' }, { status: 400 });
    db.prepare('INSERT INTO items (title, price, location, description) VALUES (?, ?, ?, ?)').run(title, price, location, description);
    return Response.json({ ok: true }, { status: 201 });
  } catch { return Response.json({ error: '등록하지 못했어요.' }, { status: 400 }); }
}
