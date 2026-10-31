import { connection } from "next/server";
import { db } from "@/lib/server";
export async function GET() {
  await connection();
  return Response.json(
    db
      .prepare("SELECT DISTINCT location FROM items ORDER BY location")
      .all()
      .map((row) => row.location),
  );
}
