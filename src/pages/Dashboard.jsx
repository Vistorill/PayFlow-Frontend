import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowDownRight, Send, CreditCard, Landmark } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useWallet } from "../context/WalletContext";
import { useAuth } from "../context/AuthContext";
import { creditOffer } from "../data/mockData";
import TransacaoDetalhe from "../components/TransacaoDetalhe";
import ChipLancamento from "../components/ChipLancamento";

const currency = (v) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Evolução do saldo reconstruída a partir do próprio ledger: parte do saldo
// atual (vindo do backend) e "desfaz" os lançamentos do mais novo ao mais antigo.
function historicoDeSaldo(ledger, saldoAtual) {
  const porDia = new Map();
  let saldo = saldoAtual;
  for (const l of ledger) {
    const dia = new Date(l.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    if (!porDia.has(dia)) porDia.set(dia, saldo); // saldo no FIM daquele dia
    saldo -= l.value;
  }
  const pontos = [...porDia.entries()].map(([day, s]) => ({ day, saldo: Number(s.toFixed(2)) })).reverse();
  if (pontos.length === 1) pontos.unshift({ day: "", saldo: Number(saldo.toFixed(2)) });
  return pontos.slice(-10);
}

export default function Dashboard() {
  const { balance, ledger, loading, error } = useWallet();
  const { user } = useAuth();
  const recent = ledger.slice(0, 5);
  const [aberta, setAberta] = useState(null);
  const balanceHistory = useMemo(() => historicoDeSaldo(ledger, balance), [ledger, balance]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-ink-500 text-sm">Olá, {user?.nome?.split(" ")[0]}</p>
        <h1 className="font-display text-2xl font-semibold">Visão geral</h1>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 rounded-2xl border border-base-700 bg-gradient-to-br from-brand-700/30 via-base-900 to-base-900 p-6">
          <p className="text-xs text-brand-300 mb-1">Saldo disponível</p>
          <p className={`font-display text-4xl font-semibold mb-6 ${loading && ledger.length === 0 ? "opacity-40" : ""}`}>
            {currency(balance)}
          </p>
          <div className="h-20 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={balanceHistory}>
                <XAxis dataKey="day" hide />
                <YAxis hide domain={["dataMin - 200", "dataMax + 200"]} />
                <Tooltip
                  contentStyle={{ background: "#101018", border: "1px solid #2a2a3c", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#c7c7d6" }}
                  formatter={(v) => currency(v)}
                />
                <Line type="monotone" dataKey="saldo" stroke="#9b7cff" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-3 mt-4">
            <Link
              to="/app/pix"
              className="flex items-center gap-2 text-sm bg-brand-500 hover:bg-brand-600 transition-colors px-4 py-2 rounded-lg font-medium"
            >
              <Send size={15} /> Fazer Pix
            </Link>
            <Link
              to="/app/cartao"
              className="flex items-center gap-2 text-sm bg-base-800 hover:bg-base-700 transition-colors border border-base-700 px-4 py-2 rounded-lg font-medium"
            >
              <CreditCard size={15} /> Ver cartão
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-base-700 bg-base-900 p-6 flex flex-col">
          <div className="flex items-center gap-2 text-mint-400 mb-1">
            <Landmark size={16} />
            <p className="text-xs font-medium">Microcrédito</p>
            <span className="ml-auto text-[10px] uppercase tracking-wide text-ink-500 border border-base-700 rounded px-1.5 py-0.5">
              demo
            </span>
          </div>
          <p className="font-display text-2xl font-semibold mb-1">
            {currency(creditOffer.approved - creditOffer.used)}
          </p>
          <p className="text-xs text-ink-500 mb-4">disponível de {currency(creditOffer.approved)} aprovados</p>
          <div className="mt-auto space-y-1.5 text-xs text-ink-500">
            <div className="flex justify-between">
              <span>Taxa</span>
              <span className="text-ink-100">{creditOffer.rate}</span>
            </div>
            <div className="flex justify-between">
              <span>Próxima parcela</span>
              <span className="text-ink-100">{creditOffer.nextInstallment}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-base-700 bg-base-900 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold">Movimentações recentes</h2>
          <Link to="/app/extrato" className="text-xs text-brand-400 hover:text-brand-300">
            Ver extrato completo
          </Link>
        </div>
        {!loading && recent.length === 0 && (
          <p className="text-sm text-ink-500 py-3">Nenhuma movimentação ainda.</p>
        )}
        <ul className="divide-y divide-base-800">
          {recent.map((t) => (
            <li
              key={t.id}
              onClick={() => setAberta(t.transacaoId)}
              className="flex items-center justify-between py-3 cursor-pointer hover:bg-base-850 -mx-2 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center ${
                    t.value >= 0 ? "bg-mint-400/10 text-mint-400" : "bg-brand-500/10 text-brand-400"
                  }`}
                >
                  {t.value >= 0 ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {t.desc}
                    <ChipLancamento lancamento={t} />
                  </p>
                  <p className="text-xs text-ink-500">
                    {new Date(t.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  </p>
                </div>
              </div>
              <p className={`text-sm font-medium ${t.value >= 0 ? "text-mint-400" : "text-ink-100"}`}>
                {t.value >= 0 ? "+" : ""}
                {currency(t.value)}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {aberta && <TransacaoDetalhe transacaoId={aberta} onClose={() => setAberta(null)} />}
    </div>
  );
}
