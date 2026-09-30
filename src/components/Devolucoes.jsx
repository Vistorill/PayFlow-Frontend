import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, AlertTriangle, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { api, ApiError, NetworkError } from "../api/client";
import { novaIdempotencyKey } from "../utils/idempotencia";
import {
  aceitaDevolucao,
  currency,
  dataHora,
  descricaoMotivo,
  MOTIVOS_DEVOLUCAO,
  rotuloMotivoDevolucao,
  STATUS_DEVOLUCAO,
} from "../utils/spi";

const MENSAGENS = {
  VALOR_EXCEDE_DEVOLVIVEL: "O valor é maior do que ainda pode ser devolvido deste Pix.",
  SALDO_INSUFICIENTE: "Saldo insuficiente para fazer a devolução.",
  PIX_NAO_DEVOLVIVEL: "Este Pix não pode mais ser devolvido.",
  IDEMPOTENCY_KEY_REUTILIZADA: "Esta tentativa já foi usada em outra devolução. Envie de novo.",
};

const emAndamento = (d) => d.status === "SOLICITADA" || d.status === "ENVIADA";

/**
 * Devoluções (pacs.004) de um Pix entre bancos: lista as enviadas e recebidas
 * e, se o Pix foi RECEBIDO de outro banco, permite devolver tudo ou parte.
 */
export default function Devolucoes({ transacao, onMudou }) {
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [aberto, setAberto] = useState(false);
  const [valor, setValor] = useState("");
  const [motivo, setMotivo] = useState("MD06");
  const [info, setInfo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);
  const chaveRef = useRef(null);

  const carregar = useCallback(async () => {
    const r = await api.get(`/pix/transacoes/${transacao.id}/devolucoes`);
    setLista(r);
    setCarregando(false);
    return r;
  }, [transacao.id]);

  useEffect(() => {
    carregar().catch(() => setCarregando(false));
  }, [carregar]);

  // Enquanto houver devolução aguardando o pacs.002, consulta de novo.
  const algumaEmAndamento = lista.some(emAndamento);
  useEffect(() => {
    if (!algumaEmAndamento) return undefined;
    const timer = setInterval(async () => {
      const r = await carregar().catch(() => null);
      if (r && !r.some(emAndamento)) onMudou?.();
    }, 1500);
    return () => clearInterval(timer);
  }, [algumaEmAndamento, carregar, onMudou]);

  const recebido = transacao.direcao === "RECEBIDA";
  const jaDevolvido = lista
    .filter((d) => d.direcao === "ENVIADA" && d.status !== "REJEITADA")
    .reduce((soma, d) => soma + Number(d.valor), 0);
  const devolvivel = Math.max(0, Number(transacao.valor) - jaDevolvido);
  const podeDevolver = recebido && aceitaDevolucao(transacao.statusSpi) && devolvivel > 0;

  function abrirFormulario() {
    setValor(devolvivel.toFixed(2).replace(".", ","));
    setErro(null);
    chaveRef.current = null;
    setAberto(true);
  }

  async function devolver(e) {
    e.preventDefault();
    if (enviando) return;
    const texto = valor.trim().replace(/\./g, "").replace(",", ".");
    if (!/^\d+(\.\d{1,2})?$/.test(texto) || Number(texto) <= 0) {
      setErro("Informe um valor maior que zero, com até 2 casas decimais.");
      return;
    }
    chaveRef.current ??= novaIdempotencyKey().replace("pix-", "dev-");
    setEnviando(true);
    setErro(null);
    try {
      await api.post(`/pix/transacoes/${transacao.id}/devolucoes`, {
        valor: texto,
        motivo,
        infoAdicional: info.trim() || undefined,
        idempotencyKey: chaveRef.current,
      });
      chaveRef.current = null;
      setAberto(false);
      setInfo("");
      await carregar();
      onMudou?.();
    } catch (e2) {
      // Falha de rede: mantém a chave, o reenvio não devolve duas vezes.
      if (!(e2 instanceof NetworkError)) chaveRef.current = null;
      if (e2 instanceof ApiError && e2.codigo === "VALOR_EXCEDE_DEVOLVIVEL" && e2.body?.devolvivel) {
        setErro(`Você pode devolver até ${currency(e2.body.devolvivel)}.`);
      } else {
        setErro(MENSAGENS[e2.codigo] ?? e2.message);
      }
    } finally {
      setEnviando(false);
    }
  }

  if (carregando && lista.length === 0 && !podeDevolver) return null;
  if (!carregando && lista.length === 0 && !podeDevolver) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-ink-300">Devoluções (pacs.004)</p>
        {recebido && (
          <p className="text-xs text-ink-500">
            Pode devolver: <span className="text-ink-100">{currency(devolvivel)}</span>
          </p>
        )}
      </div>

      <div className="rounded-xl border border-base-700 divide-y divide-base-800">
        {lista.map((d) => (
          <div key={d.id} className="px-4 py-3 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div
                className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center ${
                  d.direcao === "ENVIADA" ? "bg-brand-500/10 text-brand-400" : "bg-mint-400/10 text-mint-400"
                }`}
              >
                {d.direcao === "ENVIADA" ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
              </div>
              <div className="min-w-0">
                <p className="text-sm">
                  {d.direcao === "ENVIADA" ? "Você devolveu" : "Devolvido para você"} {currency(d.valor)}
                </p>
                <p className="text-xs text-ink-500">
                  {rotuloMotivoDevolucao(d.motivo)} · {dataHora(d.createdAt)}
                </p>
                {d.motivoRejeicao && (
                  <p className="text-xs text-red-400">
                    {descricaoMotivo(d.motivoRejeicao)}. O valor voltou para sua conta.
                  </p>
                )}
                <p className="text-[11px] text-ink-700 font-mono break-all">{d.returnId}</p>
              </div>
            </div>
            <span className={`text-[11px] px-2 py-0.5 rounded-full border shrink-0 ${STATUS_DEVOLUCAO[d.status]?.cls ?? ""}`}>
              {STATUS_DEVOLUCAO[d.status]?.label ?? d.status}
            </span>
          </div>
        ))}

        {podeDevolver && !aberto && (
          <div className="px-4 py-3">
            <button
              type="button"
              onClick={abrirFormulario}
              className="flex items-center gap-2 text-sm text-brand-300 hover:text-brand-400"
            >
              <RotateCcw size={15} /> Devolver este Pix
            </button>
          </div>
        )}

        {aberto && (
          <form onSubmit={devolver} className="px-4 py-4 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="dev-valor" className="block text-xs text-ink-300 mb-1">
                  Valor a devolver
                </label>
                <input
                  id="dev-valor"
                  value={valor}
                  onChange={(e) => {
                    setValor(e.target.value);
                    chaveRef.current = null;
                  }}
                  inputMode="decimal"
                  className="w-full rounded-lg bg-field text-base-950 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label htmlFor="dev-motivo" className="block text-xs text-ink-300 mb-1">
                  Motivo
                </label>
                <select
                  id="dev-motivo"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="w-full rounded-lg bg-field text-base-950 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {MOTIVOS_DEVOLUCAO.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="dev-info" className="block text-xs text-ink-300 mb-1">
                Mensagem para o pagador (opcional)
              </label>
              <input
                id="dev-info"
                value={info}
                onChange={(e) => setInfo(e.target.value)}
                maxLength={140}
                placeholder="Ex.: cobrança em duplicidade"
                className="w-full rounded-lg bg-field text-base-950 placeholder:text-base-600 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            {erro && (
              <p className="text-xs text-red-400 flex items-start gap-1.5">
                <AlertTriangle size={13} className="mt-0.5 shrink-0" /> {erro}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={enviando}
                className="flex-1 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-medium py-2"
              >
                {enviando ? "Enviando…" : "Confirmar devolução"}
              </button>
              <button
                type="button"
                onClick={() => setAberto(false)}
                className="rounded-lg border border-base-700 px-4 text-sm text-ink-300 hover:text-ink-100"
              >
                Cancelar
              </button>
            </div>
            <p className="text-[11px] text-ink-500">
              O valor sai da sua conta agora. Se o banco do pagador recusar, ele volta automaticamente.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
