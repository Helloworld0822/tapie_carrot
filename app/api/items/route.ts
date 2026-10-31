import { parseItemRequest } from '@/lib/item-photo';
import { db, user, failure, sameOrigin, itemInput } from '@/lib/server';
export async function GET(req: Request) {
  const params=new URL(req.url).searchParams;
  const q=params.get('q')?.trim() ?? '';
  const region=params.get('region')?.trim() ?? '';
  const price=params.get('price') ?? 'all';
  const sort=params.get('sort') ?? 'latest';
  if(q.length>100||region.length>50) return failure('검색 조건을 확인해주세요.');
  const term='%'+q.replace(/[!%_]/g,'!$&')+'%';
  const priceClause=price==='free'?'AND price=0':price==='under'?'AND price>0 AND price<=10000':'';
  const order=sort==='low'?'price ASC,items.id DESC':sort==='high'?'price DESC,items.id DESC':'items.id DESC';
  return Response.json(db.prepare(`SELECT items.*,users.name AS seller_name FROM items LEFT JOIN users ON users.id=items.seller_id WHERE (title LIKE ? ESCAPE '!' OR location LIKE ? ESCAPE '!' OR description LIKE ? ESCAPE '!') AND (?='' OR location=?) ${priceClause} ORDER BY ${order} LIMIT 100`).all(term,term,term,region,region));
}
export async function POST(req: Request) {
  if(!sameOrigin(req)) return failure('허용되지 않는 요청입니다.',403);
  const account=user(req); if(!account) return failure('로그인이 필요해요.',401);
  let input;
  try{input=await parseItemRequest(req);}catch{return failure('사진은 5MB 이하의 JPEG, PNG, WebP 파일로 등록해주세요.');}
  const parsed=itemInput.safeParse(input.data);if(!parsed.success)return failure('입력 내용을 확인해주세요.');
  const d=parsed.data;
  db.exec('BEGIN');
  try{
   const result=db.prepare('INSERT INTO items(title,price,location,description,seller_id,has_photo) VALUES(?,?,?,?,?,?)').run(d.title,d.price,d.location,d.description,account.id,input.photo?1:0);
   if(input.photo)db.prepare('INSERT INTO item_photos(item_id,data) VALUES(?,?)').run(result.lastInsertRowid,input.photo);
   db.exec('COMMIT');
   return Response.json(db.prepare('SELECT * FROM items WHERE id=?').get(result.lastInsertRowid),{status:201});
  }catch{db.exec('ROLLBACK');return failure('등록하지 못했어요. 다시 시도해주세요.',500);}
}
