import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { ensureSchema } from "@/lib/init-db";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSchema();
  const { rows } = await pool.query(
    "SELECT id, name, description, price, stock, created_at, updated_at FROM products ORDER BY id DESC"
  );
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  await ensureSchema();
  const { name, description, price, stock } = await req.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name é obrigatório" }, { status: 400 });
  }
  const { rows } = await pool.query(
    `INSERT INTO products (name, description, price, stock)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, description, price, stock, created_at, updated_at`,
    [name, description ?? null, price ?? 0, stock ?? 0]
  );
  return NextResponse.json(rows[0], { status: 201 });
}
