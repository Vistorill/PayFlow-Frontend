import { useCallback, useEffect, useState } from "react";
import { X, Copy, Check, ArrowUpRight, ArrowDownRight, KeyRound, Landmark, AlertTriangle, Undo2 } from "lucide-react";
import { useWallet } from "../context/WalletContext";
import { useTransacaoAoVivo } from "../hooks/useTransacaoAoVivo";
import { currency, dataHora, descricaoMotivo, STATUS_SPI } from "../utils/spi";
import LinhaDoTempoSpi from "./LinhaDoTempoSpi";
import Devolucoes from "./Devolucoes";

const TIPO_CHAVE = { CPF: "CPF", EMAIL: "E-mail", TELEFONE: "Celular" };

const TIPO_TRANSACAO = {
  PIX: "Pix",
  CREDITO: "Crédito em conta",
  BOLETO: "Boleto",
  CARTAO: "Cartão",
  SAQUE: "Saque",
  ESTORNO: "Estorno de Pix",
  DEVOLUCAO: "Devolução de Pix",
};

const STATUS = {
  CONCLUIDA: { label: "Concluída", cls: "text-mint-400 bg-mint-400/10 border-mint-400/20" },
  PENDENTE: { label: "Em processamento", cls: "text-amber-300 bg-amber-500/10 border-amber-500/30" },
  FALHA: { label: "Falhou", cls: "text-red-400 bg-red-500/10 border-red-500/20" },
};

export default function TransacaoDetalhe({ transacaoId, onClose }) {
  const { refresh } = useWallet();
  // Enquanto o Pix estiver aguardando o SPI, o comprovante se atualiza sozinho.
  const { loading, erro, t, recarregar } = useTransacaoAoVivo(transacaoId, { onFinal: refresh });
  const aoMudarDevolucoes = useCallback(() => {
    recarregar().catch(() => {});
    refresh();
  }, [recarregar, refresh]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const enviada = t?.direcao === "ENVIADA";
  const titulo = t
    ? t.tipo === "PIX"
      ? enviada ? "Pix enviado" : "Pix recebido"
      : TIPO_TRANSACAO[t.tipo] ?? t.tipo
    : "Detalhes da transação";
  const spi = t?.statusSpi ? STATUS_SPI[t.statusSpi] : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-base-950/70 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
    >
      <div
        className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-base-700 bg-base-900 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-base-800 bg-base-900">
          <h2 className="font-display font-semibold">{titulo}</h2>
          <button onClick={onClose} className="text-ink-500 hover:text-ink-100" aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        {loading && <p className="p-6 text-sm text-ink-500">Carregando detalhes…</p>}
        {erro && <p className="p-6 text-sm text-red-400">{erro}</p>}

        {t && (
          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`h-11 w-11 rounded-full flex items-center justify-center ${
                    enviada ? "bg-brand-500/10 text-brand-400" : "bg-mint-400/10 text-mint-400"
                  }`}
                >
                  {enviada ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                </div>
                <div>
                  <p className={`font-display text-2xl font-semibold ${enviada ? "" : "text-mint-400"}`}>
                    {enviada ? "−" : "+"}
                    {currency(t.valor)}
                  </p>
                  <p className="text-xs text-ink-500">{dataHora(t.createdAt)}</p>
                </div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full border ${(spi ?? STATUS[t.status])?.cls ?? ""}`}>
                {(spi ?? STATUS[t.status])?.label ?? t.status}
              </span>
            </div>

            {t.statusSpi === "REJEITADO" && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 flex items-start gap-3">
                <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-300">O banco de destino recusou este Pix</p>
                  <p className="text-xs text-ink-300">
                    {descricaoMotivo(t.motivoRejeicao)}. O valor foi estornado para a sua conta.
                  </p>
                </div>
              </div>
            )}

            {(t.tipo === "ESTORNO" || t.tipo === "DEVOLUCAO") && (
              <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 flex items-start gap-3">
                <Undo2 size={16} className="text-sky-300 mt-0.5 shrink-0" />
                <p className="text-xs text-ink-300">
                  {t.tipo === "ESTORNO"
                    ? "Estorno automático: o Pix original foi recusado e o valor voltou para sua conta. O lançamento original continua no extrato; o ledger nunca apaga nada."
                    : "Movimento de uma devolução de Pix (pacs.004)."}
                </p>
              </div>
            )}

            {t.endToEndId && enviada && t.tipo === "PIX" && (
              <div>
                <p className="text-xs font-medium text-ink-300 mb-2 flex items-center gap-1.5">
                  <Landmark size={13} /> Pix para outro banco
                </p>
                <div className="rounded-xl border border-base-700 px-4 pt-4">
                  <LinhaDoTempoSpi statusSpi={t.statusSpi} />
                </div>
                {t.status === "PENDENTE" && (
                  <p className="text-[11px] text-ink-500 mt-2">Atualizando automaticamente…</p>
                )}
              </div>
            )}

            {t.chaveDestino && (
              <div className="rounded-xl border border-brand-500/30 bg-brand-500/10 px-4 py-3 flex items-center gap-3">
                <KeyRound size={16} className="text-brand-300 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] text-brand-300 uppercase tracking-wide">
                    Chave Pix · {TIPO_CHAVE[t.tipoChave] ?? t.tipoChave}
                  </p>
                  <p className="text-sm font-medium break-all">{t.chaveDestino}</p>
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3">
              <Parte titulo="De" parte={t.origem} />
              <Parte titulo="Para" parte={t.destino} />
            </div>

            <Secao titulo="Dados da transação">
              <Linha rotulo="Tipo" valor={TIPO_TRANSACAO[t.tipo] ?? t.tipo} />
              <Linha rotulo="Status" valor={STATUS[t.status]?.label ?? t.status} />
              <Linha rotulo="Criada em" valor={dataHora(t.createdAt)} />
              <Linha rotulo="Atualizada em" valor={dataHora(t.updatedAt)} />
              {spi && <Linha rotulo="Situação no SPI" valor={spi.label} />}
              {t.motivoRejeicao && <Linha rotulo="Motivo da recusa" valor={descricaoMotivo(t.motivoRejeicao)} />}
              {t.endToEndId && <Linha rotulo="EndToEndId (ISO 20022)" valor={t.endToEndId} mono copiar />}
              <Linha rotulo="ID da transação" valor={t.id} mono copiar />
              {t.idempotencyKey && (
                <Linha rotulo="Chave de idempotência" valor={t.idempotencyKey} mono copiar />
              )}
            </Secao>

            {t.endToEndId && t.tipo === "PIX" && <Devolucoes transacao={t} onMudou={aoMudarDevolucoes} />}

            {t.lancamentos.length > 0 && (
              <Secao titulo="Lançamentos no ledger (partida dobrada)">
                {t.lancamentos.map((l) => (
                  <div key={l.id} className="flex items-center justify-between gap-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm">{l.descricao}</p>
                      <p className="text-xs text-ink-500">
                        {l.conta} · {l.tipo === "DEBITO" ? "Débito" : "Crédito"}
                      </p>
                    </div>
                    <p className={`text-sm font-medium ${l.tipo === "CREDITO" ? "text-mint-400" : ""}`}>
                      {l.tipo === "CREDITO" ? "+" : "−"}
                      {currency(l.valor)}
                    </p>
                  </div>
                ))}
              </Secao>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Parte({ titulo, parte }) {
  return (
    <div className="rounded-xl border border-base-700 bg-base-850 px-4 py-3">
      <p className="text-[11px] text-ink-500 uppercase tracking-wide mb-1">{titulo}</p>
      <p className="text-sm font-medium">
        {parte.nome}
        {parte.eVoce && <span className="text-ink-500 font-normal"> (você)</span>}
      </p>
      {parte.externo ? (
        <p className="text-xs text-amber-300">{parte.banco ?? "Outro banco"} · outra instituição</p>
      ) : (
        <p className="text-xs text-ink-500">CPF {parte.cpf}</p>
      )}
    </div>
  );
}

function Secao({ titulo, children }) {
  return (
    <div>
      <p className="text-xs font-medium text-ink-300 mb-2">{titulo}</p>
      <div className="rounded-xl border border-base-700 divide-y divide-base-800 px-4">{children}</div>
    </div>
  );
}

function Linha({ rotulo, valor, mono, copiar }) {
  const [copiado, setCopiado] = useState(false);

  async function copiarValor() {
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      // clipboard indisponível (ex.: http fora de localhost) — só não copia
    }
  }

  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <p className="text-xs text-ink-500 shrink-0 pt-0.5">{rotulo}</p>
      <div className="flex items-start gap-2 min-w-0">
        <p className={`text-sm text-right break-all ${mono ? "font-mono text-xs pt-0.5" : ""}`}>{valor}</p>
        {copiar && (
          <button onClick={copiarValor} className="text-ink-500 hover:text-ink-100 shrink-0" aria-label={`Copiar ${rotulo}`}>
            {copiado ? <Check size={14} className="text-mint-400" /> : <Copy size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}
