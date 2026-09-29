import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Search } from "lucide-react";
import { useWallet } from "../context/WalletContext";

const currency = (v) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const filters = [
  { id: "all", label: "Todos" },
  { id: "in", label: "Entradas" },
  { id: "out", label: "Saídas" },
];

export default function Extrato() {
  const { ledger, total, loading, error } = useWallet();
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return ledger.filter((t) => {
      if (filter === "in" && t.value < 0) return false;
      if (filter === "out" && t.value >= 0) return false;
      if (query && !t.desc.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [ledger, filter, query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Extrato</h1>
        <p className="text-sm text-ink-500 mt-1">
          Lançamentos do ledger da sua conta (append-only){total ? ` · ${total} no total` : ""}.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-600" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por descrição…"
            className="w-full rounded-lg bg-field text-base-950 placeholder:text-base-600 pl-9 pr-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`text-xs px-3 py-2 rounded-lg border transition-colors ${
                filter === f.id
                  ? "border-brand-500 bg-brand-500/15 text-brand-300"
                  : "border-base-700 text-ink-500 hover:text-ink-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-base-700 bg-base-900 divide-y divide-base-800">
        {error && <p className="p-6 text-sm text-red-400 text-center">{error}</p>}
        {loading && ledger.length === 0 && (
          <p className="p-6 text-sm text-ink-500 text-center">Carregando extrato…</p>
        )}
        {!loading && !error && filtered.length === 0 && (
          <p className="p-6 text-sm text-ink-500 text-center">Nenhum lançamento encontrado.</p>
        )}
        {filtered.map((t) => (
          <div key={t.id} className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center ${
                  t.value >= 0 ? "bg-mint-400/10 text-mint-400" : "bg-brand-500/10 text-brand-400"
                }`}
              >
                {t.value >= 0 ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
              </div>
              <div>
                <p className="text-sm font-medium">{t.desc}</p>
                <p className="text-xs text-ink-500">
                  {new Date(t.date).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            <p className={`text-sm font-medium ${t.value >= 0 ? "text-mint-400" : "text-ink-100"}`}>
              {t.value >= 0 ? "+" : ""}
              {currency(t.value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
