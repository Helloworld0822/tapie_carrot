import { DatabaseSync } from "node:sqlite";

export const db = new DatabaseSync(
  process.env.DATABASE_PATH || "carrot.sqlite",
);
db.exec(`PRAGMA foreign_keys=ON;
PRAGMA busy_timeout=5000;
PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,email TEXT NOT NULL UNIQUE,name TEXT NOT NULL,password TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id INTEGER NOT NULL REFERENCES users(id),expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS items(id INTEGER PRIMARY KEY,title TEXT NOT NULL,price INTEGER NOT NULL,location TEXT NOT NULL,description TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS chats(id INTEGER PRIMARY KEY,item_id INTEGER NOT NULL REFERENCES items(id),buyer_id INTEGER NOT NULL REFERENCES users(id),seller_id INTEGER NOT NULL REFERENCES users(id),UNIQUE(item_id,buyer_id));
CREATE TABLE IF NOT EXISTS messages(id INTEGER PRIMARY KEY,chat_id INTEGER NOT NULL REFERENCES chats(id),sender_id INTEGER NOT NULL REFERENCES users(id),text TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);`);
if (
  !db
    .prepare("PRAGMA table_info(items)")
    .all()
    .some((c) => c.name === "seller_id")
)
  db.exec(
    "ALTER TABLE items ADD COLUMN seller_id INTEGER REFERENCES users(id)",
  );
db.exec(
  "CREATE TABLE IF NOT EXISTS item_photos(item_id INTEGER PRIMARY KEY REFERENCES items(id), data BLOB NOT NULL)",
);
if (
  !db
    .prepare("PRAGMA table_info(items)")
    .all()
    .some((c) => c.name === "has_photo")
)
  db.exec("ALTER TABLE items ADD COLUMN has_photo INTEGER NOT NULL DEFAULT 0");

db.exec(`CREATE INDEX IF NOT EXISTS messages_chat_id ON messages(chat_id,id);
CREATE INDEX IF NOT EXISTS chats_seller_id ON chats(seller_id,id);
CREATE INDEX IF NOT EXISTS sessions_expires ON sessions(expires);
CREATE INDEX IF NOT EXISTS items_location_id ON items(location,id);`);
