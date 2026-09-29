import { useRef, useState } from "react";
import { Send, CheckCircle2, KeyRound, AlertTriangle } from "lucide-react";
import { useWallet } from "../context/WalletContext";
import { novaIdempotencyKey } from "../utils/idempotencia";
import { formatarCpf, isCpfValido } from "../utils/cpf";

const currency = (v) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Mensagens por `codigo` do backend — não pelo texto, que pode mudar.
const MENSAGENS = {
  SALDO_INSUFICIENTE: "Saldo insuficiente para esta transferência.",
  DESTINO_IGUAL_ORIGEM: "Não é possível transferir para você mesmo.",
  TRANSACAO_EM_PROCESSAMENTO:
    "Sua transferência anterior ainda está sendo processada. Aguarde e tente novamente.",
  TRANSACAO_ANTERIOR_FALHOU: "A tentativa anterior falhou. Envie novamente para gerar uma nova tentativa.",
};

function mensagemDoErro(r) {
  if (r.codigo === "SALDO_INSUFICIENTE" && r.body?.saldo) {
    return `Saldo insuficiente: você tem ${currency(Number(r.body.saldo))} e tentou enviar ${currency(
      Number(r.body.valorSolicitado),
    )}.`;
  }
  if (r.codigo && MENSAGENS[r.codigo]) return MENSAGENS[r.codigo];
  if (r.status === 404) return "Chave Pix não encontrada.";
  if (r.network) {
    return "Sem conexão com o servidor. Tente de novo — o reenvio usa a mesma chave de idempotência, sem risco de débito duplo.";
  }
  return r.message;
}

// Parse de "1.234,56" / "1234.56" / "50" para string com ponto decimal.
function normalizarValor(texto) {
  const t = String(texto).trim().replace(/\s/g, "");
  const semMilhar = t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t;
  return semMilhar;
}

export default function Pix() {
  const { balance, sendPix } = useWallet();
  const [pixKey, setPixKey] = useState("");
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  // Uma chave por TENTATIVA de transferência. Sobrevive a retries (falha de
  // rede / 409 em processamento) e só é descartada quando a tentativa termina
  // de forma definitiva ou quando o usuário muda o destino/valor.
  const idempotencyKeyRef = useRef(null);

  function novaIntencao() {
    idempotencyKeyRef.current = null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return; // clique duplo não gera duas requisições
    setFeedback(null);

    if (!isCpfValido(pixKey)) {
      setFeedback({ ok: false, message: "CPF inválido — confira a chave Pix." });
      return;
    }
    const valor = normalizarValor(value);
    if (!/^\d+(\.\d{1,2})?$/.test(valor) || Number(valor) <= 0) {
      setFeedback({ ok: false, message: "Informe um valor maior que zero, com até 2 casas decimais." });
      return;
    }

    if (!idempotencyKeyRef.current) idempotencyKeyRef.current = novaIdempotencyKey();
    const idempotencyKey = idempotencyKeyRef.current;

    setLoading(true);
    const result = await sendPix({ key: pixKey, value: valor, idempotencyKey });
    setLoading(false);

    if (result.ok) {
      novaIntencao();
      setFeedback({ ok: true, resultado: result.resultado });
      setPixKey("");
      setValue("");
      return;
    }

    const podeReenviarMesmaChave = result.network || result.codigo === "TRANSACAO_EM_PROCESSAMENTO";
    if (!podeReenviarMesmaChave) novaIntencao();
    setFeedback({ ok: false, codigo: result.codigo, message: mensagemDoErro(result) });
  }

  const r = feedback?.ok ? feedback.resultado : null;

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="font-display text-2xl font-semibold">Transferir com Pix</h1>
        <p className="text-sm text-ink-500 mt-1">
          Saldo disponível: <span className="text-ink-100 font-medium">{currency(balance)}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-base-700 bg-base-900 p-6 space-y-5">
        <div>
          <label className="block text-xs font-medium text-ink-300 mb-1.5">
            Chave Pix do destinatário (CPF)
          </label>
          <div className="relative">
            <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-600" />
            <input
              value={pixKey}
              onChange={(e) => {
                setPixKey(formatarCpf(e.target.value));
                novaIntencao();
              }}
              placeholder="000.000.000-00"
              inputMode="numeric"
              className="w-full rounded-lg bg-field text-base-950 placeholder:text-base-600 pl-9 pr-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-ink-300 mb-1.5">Valor</label>
          <input
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              novaIntencao();
            }}
            placeholder="0,00"
            inputMode="decimal"
            className="w-full rounded-lg bg-field text-base-950 placeholder:text-base-600 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            required
          />
        </div>

        {feedback && !feedback.ok && (
          <p
            className={`text-sm rounded-lg px-3 py-2 flex items-start gap-2 border ${
              feedback.codigo === "SALDO_INSUFICIENTE"
                ? "text-amber-300 bg-amber-500/10 border-amber-500/30"
                : "text-red-400 bg-red-500/10 border-red-500/20"
            }`}
          >
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            {feedback.message}
          </p>
        )}
        {r && (
          <div className="text-sm text-mint-400 bg-mint-400/10 border border-mint-400/20 rounded-lg px-3 py-2.5 space-y-1">
            <p className="flex items-center gap-2 font-medium">
              <CheckCircle2 size={15} /> Pix de {currency(Number(r.valor))} enviado para {r.destino.nome}.
            </p>
            <p className="text-xs text-ink-500">
              Novo saldo: {currency(Number(r.saldoOrigem))} · status {r.status}
            </p>
            <p className="text-[11px] text-ink-500 font-mono break-all">idempotencyKey: {r.idempotencyKey}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-60 transition-colors text-white font-medium py-2.5 text-sm"
        >
          <Send size={15} />
          {loading ? "Processando…" : "Enviar Pix"}
        </button>

        <p className="text-[11px] text-ink-500 leading-relaxed">
          Saldo suficiente, destino ≠ origem e duplicidade são validados no
          backend. Cada tentativa leva uma chave de idempotência gerada aqui:
          se a rede cair e você reenviar, o servidor reconhece a chave e nunca
          debita duas vezes.
        </p>
      </form>
    </div>
  );
}
