import { useState } from "react";
import { Lock, Unlock, Eye, EyeOff, Wifi } from "lucide-react";
import { card } from "../data/mockData";
import { useAuth } from "../context/AuthContext";

export default function Cartao() {
  const [blocked, setBlocked] = useState(card.blocked);
  const [reveal, setReveal] = useState(false);
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="font-display text-2xl font-semibold">Cartão</h1>
        <p className="text-sm text-ink-500 mt-1">
          Pré-pago, débito e crédito em um só plástico. <span className="text-ink-700">(protótipo de tela — sem módulo de cartão no backend)</span>
        </p>
      </div>

      <div
        className={`relative rounded-2xl p-6 h-52 flex flex-col justify-between overflow-hidden border ${
          blocked ? "border-base-700 opacity-60" : "border-brand-600/40"
        } bg-gradient-to-br from-brand-700 via-brand-600 to-base-900`}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-white/70">PayFlow</p>
            <p className="text-xs text-white/70">{card.type}</p>
          </div>
          <Wifi size={20} className="text-white/70 rotate-90" />
        </div>

        <div>
          <p className="font-mono text-lg tracking-widest text-white mb-3">
            {reveal ? "5412 3391 0044 8830" : card.number}
          </p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] text-white/60 uppercase">Titular</p>
              <p className="text-sm text-white font-medium">{user?.nome?.toUpperCase() ?? card.holder}</p>
            </div>
            <div>
              <p className="text-[10px] text-white/60 uppercase">Validade</p>
              <p className="text-sm text-white font-medium">{card.expiry}</p>
            </div>
            <p className="text-white font-display font-semibold italic">{card.brand}</p>
          </div>
        </div>

        {blocked && (
          <div className="absolute inset-0 bg-base-950/60 flex items-center justify-center backdrop-blur-[1px]">
            <span className="flex items-center gap-2 text-sm font-medium bg-base-900 border border-base-700 px-4 py-2 rounded-full">
              <Lock size={14} /> Cartão bloqueado
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setReveal((r) => !r)}
          className="flex items-center justify-center gap-2 rounded-lg border border-base-700 bg-base-900 hover:bg-base-800 transition-colors py-2.5 text-sm font-medium"
        >
          {reveal ? <EyeOff size={15} /> : <Eye size={15} />}
          {reveal ? "Ocultar número" : "Ver número completo"}
        </button>
        <button
          onClick={() => setBlocked((b) => !b)}
          className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors ${
            blocked
              ? "bg-mint-400/10 border border-mint-400/30 text-mint-400 hover:bg-mint-400/20"
              : "bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20"
          }`}
        >
          {blocked ? <Unlock size={15} /> : <Lock size={15} />}
          {blocked ? "Desbloquear cartão" : "Bloquear cartão"}
        </button>
      </div>

      <div className="rounded-2xl border border-base-700 bg-base-900 p-6">
        <h2 className="font-display font-semibold mb-4">Sobre o seu cartão</h2>
        <dl className="space-y-3 text-sm">
          <Row label="Função" value="Pré-pago · Débito · Crédito (3 em 1)" />
          <Row label="Bandeira" value={card.brand} />
          <Row label="Status" value={blocked ? "Bloqueado" : "Ativo"} />
          <Row label="Saque em rede parceira" value="Rede Banco24Horas" />
        </dl>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between border-b border-base-800 pb-3 last:border-0 last:pb-0">
      <dt className="text-ink-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
