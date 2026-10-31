import { DatabaseSync } from 'node:sqlite';
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';

export const db = new DatabaseSync(process.env.DATABASE_PATH || 'carrot.sqlite');
db.exec(`PRAGMA foreign_keys=ON;
PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,email TEXT NOT NULL UNIQUE,name TEXT NOT NULL,password TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id INTEGER NOT NULL REFERENCES users(id),expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS items(id INTEGER PRIMARY KEY,title TEXT NOT NULL,price INTEGER NOT NULL,location TEXT NOT NULL,description TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS chats(id INTEGER PRIMARY KEY,item_id INTEGER NOT NULL REFERENCES items(id),buyer_id INTEGER NOT NULL REFERENCES users(id),seller_id INTEGER NOT NULL REFERENCES users(id),UNIQUE(item_id,buyer_id));
CREATE TABLE IF NOT EXISTS messages(id INTEGER PRIMARY KEY,chat_id INTEGER NOT NULL REFERENCES chats(id),sender_id INTEGER NOT NULL REFERENCES users(id),text TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);`);
if (!db.prepare('PRAGMA table_info(items)').all().some(c => c.name === 'seller_id')) db.exec('ALTER TABLE items ADD COLUMN seller_id INTEGER REFERENCES users(id)');
db.exec('CREATE TABLE IF NOT EXISTS item_photos(item_id INTEGER PRIMARY KEY REFERENCES items(id), data BLOB NOT NULL)');
if (!db.prepare('PRAGMA table_info(items)').all().some(c=>c.name==='has_photo')) db.exec('ALTER TABLE items ADD COLUMN has_photo INTEGER NOT NULL DEFAULT 0');
export function failure(error: string, status = 400) { return Response.json({ error }, { status }); }
export function sameOrigin(req: Request) { const origin = req.headers.get('origin'); return !origin || origin === new URL(req.url).origin; }
export function user(req: Request) {
  const token = req.headers.get('cookie')?.split(';').map(v => v.trim()).find(v => v.startsWith('session='))?.slice(8);
  if (!token) return null;
  return db.prepare('SELECT users.id,users.name,users.email FROM sessions JOIN users ON users.id=sessions.user_id WHERE token=? AND expires>?').get(createHash('sha256').update(token).digest('hex'), Date.now()) ?? null;
}
export function session(userId: number | bigint) {
  const token = randomBytes(32).toString('hex');
  db.prepare('DELETE FROM sessions WHERE expires<=?').run(Date.now());
  db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(createHash('sha256').update(token).digest('hex'),userId,Date.now()+604800000);
  return `session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
}
export function hash(password: string) { const salt=randomBytes(16).toString('hex'); return salt+':'+scryptSync(password,salt,64).toString('hex'); }
export function matches(password: string, stored: string) { const [salt,key]=stored.split(':'); return timingSafeEqual(scryptSync(password,salt,64),Buffer.from(key,'hex')); }
export async function body(req: Request) { try { return await req.json(); } catch { return null; } }
export const credentials=z.object({email:z.email().max(254).transform(v=>v.toLowerCase()),password:z.string().min(8).max(128)});
export const itemInput=z.object({title:z.string().trim().min(1).max(100),price:z.union([z.number(),z.string().trim().regex(/^\d+$/)]).transform(Number).pipe(z.number().int().min(0).max(Number.MAX_SAFE_INTEGER)),location:z.string().trim().min(1).max(50),description:z.string().trim().max(2000).default('')});
