import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FlaskConical, ArrowDownRight, RotateCcw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "../context/WalletContext";
import { currency, MOTIVOS_DEVOLUCAO } from "../utils/spi";

// O simulador do SPI decide a resposta pelos centavos do valor.
const REGRAS = [
  { valor: "25,00", resultado: "Concluído", detalhe: "pacs.002 ACCC em ~1,5s" },
  { valor: "10,99", resultado: "Recusado e estornado", detalhe: "pacs.002 RJCT AC03" },
  { valor: "5,98", resultado: "Sem resposta → confirmado", detalhe: "Reconciliação liquida em ~30-45s" },
  { valor: "5,97", resultado: "Sem resposta → estornado", detalhe: "Reconciliação estorna após 2 min" },
];

function normalizarValor(texto) {
  const t = String(texto).trim().replace(/\s/g, "");
  return t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t;
}

const valorValido = (v) => /^\d+(\.\d{1,2})?$/.test(v) && Number(v) > 0;

/**
 * Página de demonstração: faz o papel do OUTRO banco. Só existe enquanto o
 * backend usa o simulador do SPI (em produção as rotas respondem 404).
 */
export default function Simulador() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
          <FlaskConical size={22} className="text-brand-400" /> Simulador do SPI
        </h1>
        <p className="text-sm text-ink-500 mt-1 max-w-2xl">
          Aqui você faz o papel de outro banco: envia um Pix para esta conta (pacs.008) ou devolve um Pix que ela
          enviou (pacs.004). As mensagens passam pelo mesmo caminho real: SPI Adapter, fila de mensagens, ledger,
          notificação e webhook.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <PixRecebido />
        <DevolucaoRecebida />
      </div>

      <section className="rounded-2xl border border-base-700 bg-base-900 p-6 space-y-3">
        <h2 className="font-display font-semibold">Respostas do banco de destino, pelo valor</h2>
        <p className="text-sm text-ink-500">
          Ao fazer um <Link to="/app/pix" className="text-brand-400 hover:text-brand-300">Pix para outro banco</Link>, o
          simulador responde de acordo com os centavos:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-ink-500 border-b border-base-800">
                <th className="py-2 pr-4 font-medium">Exemplo</th>
                <th className="py-2 pr-4 font-medium">Resultado</th>
                <th className="py-2 font-medium">Por dentro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-800">
              {REGRAS.map((r) => (
                <tr key={r.valor}>
                  <td className="py-2.5 pr-4 font-mono tabular-nums">R$ {r.valor}</td>
                  <td className="py-2.5 pr-4">{r.resultado}</td>
                  <td className="py-2.5 text-ink-500">{r.detalhe}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-ink-500">Qualquer outro valor é concluído. Terminado em ,99 é sempre recusado.</p>
      </section>
    </div>
  );
}

function Resultado({ ok, children }) {
  return (
    <p
      className={`text-sm rounded-lg px-3 py-2 flex items-start gap-2 border ${
        ok ? "text-mint-400 bg-mint-400/10 border-mint-400/20" : "text-red-400 bg-red-500/10 border-red-500/20"
      }`}
    >
      {ok ? <CheckCircle2 size={15} className="mt-0.5 shrink-0" /> : <AlertTriangle size={15} className="mt-0.5 shrink-0" />}
      <span>{children}</span>
    </p>
  );
}

function PixRecebido() {
  const { user } = useAuth();
  const [chave, setChave] = useState(user?.cpfMasked ?? "");
  const [valor, setValor] = useState("50,00");
  const [pagador, setPagador] = useState("Carlos Pereira");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [retorno, setRetorno] = useState(null);

  async function enviar(e) {
    e.preventDefault();
    const v = normalizarValor(valor);
    if (!valorValido(v)) {
      setRetorno({ ok: false, texto: "Informe um valor maior que zero, com até 2 casas decimais." });
      return;
    }
    setEnviando(true);
    setRetorno(null);
    try {
      const r = await api.post("/spi/simulador/pix-recebido", {
        chave: chave.trim(),
        valor: v,
        pagadorNome: pagador.trim() || undefined,
        mensagem: mensagem.trim() || undefined,
      });
      setRetorno({
        ok: true,
        texto: `pacs.008 enviado (${r.endToEndId}). Em instantes o crédito cai na conta dona da chave e a notificação aparece no sino.`,
      });
    } catch (e2) {
      setRetorno({ ok: false, texto: e2.status === 404 ? "Simulador desligado no backend." : e2.message });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="rounded-2xl border border-base-700 bg-base-900 p-6 space-y-4">
      <div className="flex items-center gap-2">
        <span className="h-8 w-8 rounded-full bg-mint-400/10 text-mint-400 flex items-center justify-center">
          <ArrowDownRight size={16} />
        </span>
        <div>
          <h2 className="font-display font-semibold">Receber Pix de outro banco</h2>
          <p className="text-xs text-ink-500">Mensagem pacs.008 de entrada</p>
        </div>
      </div>

      <Campo id="sim-chave" rotulo="Chave Pix de quem recebe" dica="CPF, e-mail ou celular de qualquer conta PayFlow. Uma chave inexistente gera pacs.002 RJCT AC03.">
        <input id="sim-chave" value={chave} onChange={(e) => setChave(e.target.value)} required className={CLASSE_INPUT} />
      </Campo>
      <div className="grid sm:grid-cols-2 gap-3">
        <Campo id="sim-valor" rotulo="Valor">
          <input id="sim-valor" value={valor} onChange={(e) => setValor(e.target.value)} inputMode="decimal" required className={CLASSE_INPUT} />
        </Campo>
        <Campo id="sim-pagador" rotulo="Nome de quem paga">
          <input id="sim-pagador" value={pagador} onChange={(e) => setPagador(e.target.value)} maxLength={120} className={CLASSE_INPUT} />
        </Campo>
      </div>
      <Campo id="sim-msg" rotulo="Mensagem (opcional)">
        <input id="sim-msg" value={mensagem} onChange={(e) => setMensagem(e.target.value)} maxLength={140} placeholder="Almoço" className={CLASSE_INPUT} />
      </Campo>

      {retorno && <Resultado ok={retorno.ok}>{retorno.texto}</Resultado>}

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-medium py-2.5"
      >
        {enviando ? "Enviando…" : "Enviar Pix para esta chave"}
      </button>
    </form>
  );
}

function DevolucaoRecebida() {
  const { ledger } = useWallet();
  // Pix que esta conta enviou para outro banco e que já foram concluídos.
  const elegiveis = useMemo(
    () =>
      ledger.filter(
        (l) =>
          l.tipoTransacao === "PIX" &&
          l.value < 0 &&
          (l.statusSpi === "LIQUIDADO" || l.statusSpi === "DEVOLVIDO_PARCIAL"),
      ),
    [ledger],
  );
  const [transacaoId, setTransacaoId] = useState("");
  const [valor, setValor] = useState("");
  const [motivo, setMotivo] = useState("SL02");
  const [enviando, setEnviando] = useState(false);
  const [retorno, setRetorno] = useState(null);

  const escolhido = elegiveis.find((l) => l.transacaoId === transacaoId);

  async function enviar(e) {
    e.preventDefault();
    if (!escolhido) {
      setRetorno({ ok: false, texto: "Escolha um Pix enviado para outro banco." });
      return;
    }
    const v = normalizarValor(valor || String(Math.abs(escolhido.value)));
    if (!valorValido(v)) {
      setRetorno({ ok: false, texto: "Informe um valor maior que zero, com até 2 casas decimais." });
      return;
    }
    setEnviando(true);
    setRetorno(null);
    try {
      const t = await api.get(`/transacoes/${escolhido.transacaoId}`);
      const r = await api.post("/spi/simulador/devolucao-recebida", { endToEndId: t.endToEndId, valor: v, motivo });
      setRetorno({
        ok: true,
        texto: `pacs.004 enviado (${r.returnId}). O valor volta para esta conta em instantes. Se passar do que ainda pode ser devolvido, respondemos pacs.002 RJCT e nada é creditado.`,
      });
    } catch (e2) {
      setRetorno({ ok: false, texto: e2.status === 404 ? "Simulador desligado no backend." : e2.message });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="rounded-2xl border border-base-700 bg-base-900 p-6 space-y-4">
      <div className="flex items-center gap-2">
        <span className="h-8 w-8 rounded-full bg-sky-500/10 text-sky-300 flex items-center justify-center">
          <RotateCcw size={16} />
        </span>
        <div>
          <h2 className="font-display font-semibold">Outro banco devolve um Pix seu</h2>
          <p className="text-xs text-ink-500">Mensagem pacs.004 de entrada</p>
        </div>
      </div>

      <Campo id="sim-pix" rotulo="Pix enviado para outro banco">
        <select
          id="sim-pix"
          value={transacaoId}
          onChange={(e) => {
            setTransacaoId(e.target.value);
            setValor("");
            setRetorno(null);
          }}
          className={CLASSE_INPUT}
        >
          <option value="">{elegiveis.length ? "Selecione" : "Nenhum Pix externo concluído"}</option>
          {elegiveis.map((l) => (
            <option key={l.id} value={l.transacaoId}>
              {currency(Math.abs(l.value))} · {l.desc} · {new Date(l.date).toLocaleDateString("pt-BR")}
            </option>
          ))}
        </select>
      </Campo>
      <div className="grid sm:grid-cols-2 gap-3">
        <Campo id="sim-dev-valor" rotulo="Valor devolvido" dica={escolhido ? `Vazio = ${currency(Math.abs(escolhido.value))}` : undefined}>
          <input id="sim-dev-valor" value={valor} onChange={(e) => setValor(e.target.value)} inputMode="decimal" className={CLASSE_INPUT} />
        </Campo>
        <Campo id="sim-dev-motivo" rotulo="Motivo">
          <select id="sim-dev-motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} className={CLASSE_INPUT}>
            {MOTIVOS_DEVOLUCAO.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </Campo>
      </div>
      {elegiveis.length === 0 && (
        <p className="text-xs text-ink-500">
          Faça antes um <Link to="/app/pix" className="text-brand-400 hover:text-brand-300">Pix para um contato de outro banco</Link> e espere ele ser concluído.
        </p>
      )}

      {retorno && <Resultado ok={retorno.ok}>{retorno.texto}</Resultado>}

      <button
        type="submit"
        disabled={enviando || !escolhido}
        className="w-full rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-medium py-2.5"
      >
        {enviando ? "Enviando…" : "Devolver para esta conta"}
      </button>
    </form>
  );
}

const CLASSE_INPUT =
  "w-full rounded-lg bg-field text-base-950 placeholder:text-base-600 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500";

function Campo({ id, rotulo, dica, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-ink-300 mb-1.5">
        {rotulo}
      </label>
      {children}
      {dica && <p className="text-[11px] text-ink-500 mt-1">{dica}</p>}
    </div>
  );
}
