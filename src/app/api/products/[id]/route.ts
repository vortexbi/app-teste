import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { name, description, price, stock } = await req.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name é obrigatório" }, { status: 400 });
  }
  const { rows } = await pool.query(
    `UPDATE products
     SET name=$1, description=$2, price=$3, stock=$4, updated_at=NOW()
     WHERE id=$5
     RETURNING id, name, description, price, stock, created_at, updated_at`,
    [name, description ?? null, price ?? 0, stock ?? 0, id]
  );
  if (rows.length === 0) {
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  }
  return NextResponse.json(rows[0]);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { rowCount } = await pool.query("DELETE FROM products WHERE id=$1", [id]);
  if (rowCount === 0) {
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  }
  return new Response(null, { status: 204 });
}
