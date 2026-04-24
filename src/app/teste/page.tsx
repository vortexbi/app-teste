"use client";
import { useEffect, useState } from "react";

type Item = { id: number; name: string; created_at: string };

export default function TestePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const r = await fetch("/api/items", { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setItems(await r.json());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setName("");
    load();
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold mb-2">Teste de conexão Postgres</h1>
      <p className="text-sm text-gray-500 mb-6">
        Adicione itens; eles persistem no banco configurado em{" "}
        <code>DATABASE_URL</code>.
      </p>

      <form onSubmit={add} className="flex gap-2 mb-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do item"
          className="flex-1 border rounded px-3 py-2"
        />
        <button className="bg-black text-white rounded px-4 py-2">
          Adicionar
        </button>
      </form>

      {error && (
        <div className="mb-4 p-3 border border-red-300 bg-red-50 text-red-700 rounded text-sm">
          Erro: {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">Nenhum item ainda.</p>
      ) : (
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Nome</th>
              <th className="p-2 text-left">Criado</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-t">
                <td className="p-2">{i.id}</td>
                <td className="p-2">{i.name}</td>
                <td className="p-2">
                  {new Date(i.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
