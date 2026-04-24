import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { ensureSchema } from "@/lib/init-db";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSchema();
  const { rows } = await pool.query(
    "SELECT id, name, created_at FROM items ORDER BY id DESC"
  );
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  await ensureSchema();
  const { name } = await req.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }
  const { rows } = await pool.query(
    "INSERT INTO items (name) VALUES ($1) RETURNING id, name, created_at",
    [name]
  );
  return NextResponse.json(rows[0]);
}
