"use client";
import { useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  created_at: string;
  updated_at: string;
};

const empty = { name: "", description: "", price: "", stock: "" };

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const r = await fetch("/api/products", { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setProducts(await r.json());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function startEdit(p: Product) {
    setEditing(p.id);
    setForm({
      name: p.name,
      description: p.description ?? "",
      price: p.price,
      stock: String(p.stock),
    });
  }

  function cancelEdit() {
    setEditing(null);
    setForm(empty);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        name: form.name,
        description: form.description || null,
        price: parseFloat(form.price) || 0,
        stock: parseInt(form.stock) || 0,
      };
      const url = editing ? `/api/products/${editing}` : "/api/products";
      const method = editing ? "PUT" : "POST";
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const { error } = await r.json();
        throw new Error(error);
      }
      setForm(empty);
      setEditing(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("Excluir este produto?")) return;
    try {
      const r = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!r.ok && r.status !== 204) throw new Error(`HTTP ${r.status}`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao excluir");
    }
  }

  const isEditing = editing !== null;

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold mb-6">Cadastro de Produtos</h1>

      {/* Formulário */}
      <form onSubmit={save} className="border rounded p-4 mb-8 bg-gray-50">
        <h2 className="font-semibold mb-4">
          {isEditing ? `Editando produto #${editing}` : "Novo produto"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1">Nome *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full border rounded px-3 py-2"
              placeholder="Nome do produto"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1">Descrição</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="Descrição opcional"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Preço (R$)</label>
            <input
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              type="number"
              min="0"
              step="0.01"
              className="w-full border rounded px-3 py-2"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Estoque</label>
            <input
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              type="number"
              min="0"
              step="1"
              className="w-full border rounded px-3 py-2"
              placeholder="0"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
          >
            {saving ? "Salvando..." : isEditing ? "Salvar alterações" : "Adicionar produto"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={cancelEdit}
              className="border rounded px-4 py-2"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {error && (
        <div className="mb-4 p-3 border border-red-300 bg-red-50 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {/* Tabela */}
      {loading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">Nenhum produto cadastrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">ID</th>
                <th className="p-2 text-left">Nome</th>
                <th className="p-2 text-left">Descrição</th>
                <th className="p-2 text-right">Preço</th>
                <th className="p-2 text-right">Estoque</th>
                <th className="p-2 text-left">Atualizado</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{p.id}</td>
                  <td className="p-2 font-medium">{p.name}</td>
                  <td className="p-2 text-gray-500">{p.description ?? "—"}</td>
                  <td className="p-2 text-right">
                    {Number(p.price).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td className="p-2 text-right">{p.stock}</td>
                  <td className="p-2 text-gray-500">
                    {new Date(p.updated_at).toLocaleString("pt-BR")}
                  </td>
                  <td className="p-2">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => startEdit(p)}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => remove(p.id)}
                        className="text-red-600 hover:underline text-xs"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
