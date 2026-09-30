import { useCallback, useEffect, useState } from "react";
import {
  Webhook,
  Plus,
  Send,
  KeyRound,
  Pause,
  Play,
  Trash2,
  RotateCw,
  Copy,
  Check,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { api } from "../api/client";
import { EVENTOS_WEBHOOK } from "../utils/spi";

const STATUS_ENDPOINT = {
  ATIVO: { label: "Ativo", cls: "text-mint-400 bg-mint-400/10 border-mint-400/20" },
  SUSPENSO: { label: "Suspenso por falhas", cls: "text-red-400 bg-red-500/10 border-red-500/20" },
  DESATIVADO: { label: "Pausado", cls: "text-ink-500 bg-base-800 border-base-700" },
};

const STATUS_ENTREGA = {
  PENDENTE: { label: "Na fila", cls: "text-amber-300 bg-amber-500/10 border-amber-500/30" },
  RETENTANDO: { label: "Tentando de novo", cls: "text-amber-300 bg-amber-500/10 border-amber-500/30" },
  ENTREGUE: { label: "Entregue", cls: "text-mint-400 bg-mint-400/10 border-mint-400/20" },
  ESGOTADO: { label: "Tentativas esgotadas", cls: "text-red-400 bg-red-500/10 border-red-500/20" },
  FALHA_PERMANENTE: { label: "Recusado pelo destino", cls: "text-red-400 bg-red-500/10 border-red-500/20" },
};

const FILTROS = [
  { id: "", label: "Todas" },
  { id: "ENTREGUE", label: "Entregues" },
  { id: "RETENTANDO", label: "Tentando" },
  { id: "ESGOTADO", label: "Esgotadas" },
  { id: "FALHA_PERMANENTE", label: "Recusadas" },
];

const hora = (iso) =>
  new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });

function emQuanto(iso) {
  const seg = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  if (seg <= 0) return "em instantes";
  if (seg < 60) return `em ${seg}s`;
  if (seg < 3600) return `em ${Math.round(seg / 60)} min`;
  return `em ${Math.round(seg / 3600)} h`;
}

export default function Webhooks() {
  const [endpoints, setEndpoints] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [segredo, setSegredo] = useState(null); // { url, valor } mostrado uma única vez
  const [formAberto, setFormAberto] = useState(false);

  const carregarEndpoints = useCallback(async () => {
    setEndpoints(await api.get("/webhooks/endpoints"));
  }, []);

  const carregarEntregas = useCallback(async () => {
    setEntregas(await api.get(`/webhooks/entregas?take=50${filtro ? `&status=${filtro}` : ""}`));
  }, [filtro]);

  useEffect(() => {
    Promise.all([carregarEndpoints(), carregarEntregas()])
      .then(() => setErro(null), (e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, [carregarEndpoints, carregarEntregas]);

  // Entregas mudam sozinhas (retry, dispatcher): atualiza a cada 5s.
  useEffect(() => {
    const timer = setInterval(() => {
      carregarEntregas().catch(() => {});
      carregarEndpoints().catch(() => {});
    }, 5000);
    return () => clearInterval(timer);
  }, [carregarEntregas, carregarEndpoints]);

  async function acao(fn) {
    setErro(null);
    try {
      await fn();
      await Promise.all([carregarEndpoints(), carregarEntregas()]);
    } catch (e) {
      setErro(e.message);
    }
  }

  const urlDe = (endpointId) => endpoints.find((e) => e.id === endpointId)?.url ?? "endpoint removido";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
            <Webhook size={22} className="text-brand-400" /> Webhooks
          </h1>
          <p className="text-sm text-ink-500 mt-1 max-w-2xl">
            Avise o seu sistema (ERP, loja) quando um Pix for concluído, recusado, recebido ou devolvido. Cada envio é
            assinado com HMAC-SHA256 e reenviado automaticamente se o seu servidor estiver fora do ar.
          </p>
        </div>
        {!formAberto && (
          <button
            type="button"
            onClick={() => setFormAberto(true)}
            className="flex items-center gap-2 text-sm bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg font-medium"
          >
            <Plus size={15} /> Novo webhook
          </button>
        )}
      </div>

      {erro && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 flex items-start gap-2">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" /> {erro}
        </p>
      )}

      {segredo && <CaixaSegredo segredo={segredo} onFechar={() => setSegredo(null)} />}

      {formAberto && (
        <FormularioWebhook
          onCancelar={() => setFormAberto(false)}
          onCriado={async (criado) => {
            setFormAberto(false);
            setSegredo({ url: criado.url, valor: criado.segredo });
            await carregarEndpoints();
          }}
        />
      )}

      <section className="space-y-3">
        <h2 className="font-display font-semibold">Endpoints</h2>
        {carregando && <p className="text-sm text-ink-500">Carregando…</p>}
        {!carregando && endpoints.length === 0 && !formAberto && (
          <div className="rounded-2xl border border-dashed border-base-700 p-6 text-sm text-ink-500">
            Nenhum webhook cadastrado. Cadastre a URL do seu sistema para receber os eventos de Pix.
          </div>
        )}
        {endpoints.map((e) => (
          <CartaoEndpoint
            key={e.id}
            endpoint={e}
            onTestar={() => acao(() => api.post(`/webhooks/endpoints/${e.id}/test`))}
            onRotacionar={() =>
              acao(async () => {
                const r = await api.post(`/webhooks/endpoints/${e.id}/rotate-secret`);
                setSegredo({ url: r.url, valor: r.segredo, rotacao: true });
              })
            }
            onStatus={(status) => acao(() => api.patch(`/webhooks/endpoints/${e.id}`, { status }))}
            onExcluir={() => acao(() => api.delete(`/webhooks/endpoints/${e.id}`))}
          />
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display font-semibold">Entregas recentes</h2>
          <div className="flex flex-wrap gap-2">
            {FILTROS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFiltro(f.id)}
                className={`text-xs px-3 py-1.5 rounded-lg border ${
                  filtro === f.id ? "border-brand-500 bg-brand-500/15 text-brand-300" : "border-base-700 text-ink-500 hover:text-ink-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-base-700 bg-base-900 overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-ink-500 border-b border-base-800">
                <th className="px-4 py-3 font-medium">Evento</th>
                <th className="px-4 py-3 font-medium">Situação</th>
                <th className="px-4 py-3 font-medium">Tentativas</th>
                <th className="px-4 py-3 font-medium">Resposta</th>
                <th className="px-4 py-3 font-medium">Criada</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-base-800">
              {entregas.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-ink-500">
                    Nenhuma entrega {filtro ? "com esse filtro" : "ainda"}. Faça um Pix ou use "Enviar teste".
                  </td>
                </tr>
              )}
              {entregas.map((d) => {
                const st = STATUS_ENTREGA[d.status];
                const podeReenviar = d.status !== "ENTREGUE" && d.status !== "PENDENTE";
                return (
                  <tr key={d.id} className="align-top">
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs">{d.tipoEvento}</p>
                      <p className="text-[11px] text-ink-500 truncate max-w-[220px]" title={urlDe(d.endpointId)}>
                        {urlDe(d.endpointId)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border whitespace-nowrap ${st?.cls ?? ""}`}>
                        {st?.label ?? d.status}
                      </span>
                      {d.status === "RETENTANDO" && d.proximaTentativaEm && (
                        <p className="text-[11px] text-ink-500 mt-1">próxima {emQuanto(d.proximaTentativaEm)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{d.tentativa}/7</td>
                    <td className="px-4 py-3">
                      {d.ultimoHttpStatus ? <span className="font-mono text-xs">HTTP {d.ultimoHttpStatus}</span> : "—"}
                      {d.ultimoErro && d.status !== "ENTREGUE" && (
                        <p className="text-[11px] text-red-400 max-w-[200px] break-words">{d.ultimoErro}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-500 whitespace-nowrap tabular-nums">{hora(d.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      {podeReenviar && (
                        <button
                          type="button"
                          onClick={() => acao(() => api.post(`/webhooks/entregas/${d.id}/replay`))}
                          className="inline-flex items-center gap-1 text-xs text-brand-300 hover:text-brand-400"
                        >
                          <RotateCw size={13} /> Reenviar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-ink-500">
          Política: timeout de 5s; 2xx = entregue; 4xx (exceto 408/429) = recusado sem nova tentativa; 5xx, timeout,
          408 e 429 tentam de novo em 1 min, 5 min, 30 min, 2 h, 6 h e 24 h. Após 20 falhas seguidas o endpoint é
          suspenso.
        </p>
      </section>

      <ComoVerificar />
    </div>
  );
}

function FormularioWebhook({ onCancelar, onCriado }) {
  const [url, setUrl] = useState("");
  const [descricao, setDescricao] = useState("");
  const [todos, setTodos] = useState(true);
  const [eventos, setEventos] = useState(["pix.payment.settled", "pix.payment.rejected", "pix.payment.received"]);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  function alternar(id) {
    setEventos((lista) => (lista.includes(id) ? lista.filter((e) => e !== id) : [...lista, id]));
  }

  async function salvar(e) {
    e.preventDefault();
    if (!todos && eventos.length === 0) {
      setErro("Escolha pelo menos um evento.");
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      const criado = await api.post("/webhooks/endpoints", {
        url: url.trim(),
        eventos: todos ? ["*"] : eventos,
        descricao: descricao.trim() || undefined,
      });
      await onCriado(criado);
    } catch (e2) {
      setErro(e2.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={salvar} className="rounded-2xl border border-base-700 bg-base-900 p-6 space-y-4">
      <h2 className="font-display font-semibold">Novo webhook</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="wh-url" className="block text-xs font-medium text-ink-300 mb-1.5">
            URL do seu sistema
          </label>
          <input
            id="wh-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://seusistema.com/hooks/pix"
            required
            className="w-full rounded-lg bg-field text-base-950 placeholder:text-base-600 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          />
          <p className="text-[11px] text-ink-500 mt-1">
            Precisa ser https e público. Em desenvolvimento, <code>http://localhost:4010/hook</code> funciona com
            WEBHOOK_PERMITIR_INSEGURO=true no backend.
          </p>
        </div>
        <div>
          <label htmlFor="wh-desc" className="block text-xs font-medium text-ink-300 mb-1.5">
            Descrição (opcional)
          </label>
          <input
            id="wh-desc"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            maxLength={140}
            placeholder="Produção - ERP"
            className="w-full rounded-lg bg-field text-base-950 placeholder:text-base-600 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-xs font-medium text-ink-300 mb-1.5">Eventos</legend>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={todos} onChange={(e) => setTodos(e.target.checked)} className="accent-brand-500" />
          Todos os eventos
        </label>
        {!todos && (
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 pl-1">
            {EVENTOS_WEBHOOK.map((ev) => (
              <label key={ev.id} className="flex items-start gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={eventos.includes(ev.id)}
                  onChange={() => alternar(ev.id)}
                  className="accent-brand-500 mt-1"
                />
                <span>
                  {ev.label}
                  <span className="block text-[11px] text-ink-500 font-mono">{ev.id}</span>
                </span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      {erro && (
        <p className="text-sm text-red-400 flex items-start gap-2">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" /> {erro}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={enviando}
          className="rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-medium px-4 py-2"
        >
          {enviando ? "Salvando…" : "Cadastrar webhook"}
        </button>
        <button type="button" onClick={onCancelar} className="rounded-lg border border-base-700 px-4 py-2 text-sm text-ink-300 hover:text-ink-100">
          Cancelar
        </button>
      </div>
    </form>
  );
}

function CaixaSegredo({ segredo, onFechar }) {
  const [copiado, setCopiado] = useState(false);
  async function copiar() {
    try {
      await navigator.clipboard.writeText(segredo.valor);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      // sem clipboard: o texto continua selecionável
    }
  }
  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 space-y-3">
      <p className="text-sm font-medium flex items-center gap-2">
        <KeyRound size={16} className="text-amber-300" />
        {segredo.rotacao ? "Novo segredo gerado" : "Webhook cadastrado"}: copie o segredo agora
      </p>
      <p className="text-xs text-ink-300">
        Ele não será mostrado de novo. Use-o no seu sistema para verificar a assinatura de cada envio para{" "}
        <span className="font-mono">{segredo.url}</span>.
        {segredo.rotacao && " O segredo anterior continua assinando por 24 horas, para você trocar sem perder eventos."}
      </p>
      <div className="flex items-center gap-2 rounded-lg bg-base-950 border border-base-700 px-3 py-2">
        <code className="text-xs font-mono break-all flex-1 select-all">{segredo.valor}</code>
        <button type="button" onClick={copiar} className="text-ink-300 hover:text-ink-100 shrink-0" aria-label="Copiar segredo">
          {copiado ? <Check size={15} className="text-mint-400" /> : <Copy size={15} />}
        </button>
      </div>
      <button type="button" onClick={onFechar} className="text-xs text-ink-300 hover:text-ink-100">
        Já guardei, fechar
      </button>
    </div>
  );
}

function CartaoEndpoint({ endpoint: e, onTestar, onRotacionar, onStatus, onExcluir }) {
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const st = STATUS_ENDPOINT[e.status];
  const todos = e.eventos.includes("*");

  return (
    <div className="rounded-2xl border border-base-700 bg-base-900 p-5 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-sm break-all">{e.url}</p>
          <p className="text-xs text-ink-500">
            {e.descricao ? `${e.descricao} · ` : ""}
            {todos ? "Todos os eventos" : `${e.eventos.length} evento(s)`}
            {e.falhasConsecutivas > 0 && ` · ${e.falhasConsecutivas} falha(s) seguidas`}
          </p>
        </div>
        <span className={`text-[11px] px-2 py-0.5 rounded-full border shrink-0 ${st?.cls ?? ""}`}>{st?.label ?? e.status}</span>
      </div>

      {!todos && (
        <div className="flex flex-wrap gap-1.5">
          {e.eventos.map((ev) => (
            <span key={ev} className="text-[11px] font-mono px-2 py-0.5 rounded bg-base-850 border border-base-700 text-ink-300">
              {ev}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        <BotaoAcao onClick={onTestar} disabled={e.status !== "ATIVO"} icon={Send}>
          Enviar teste
        </BotaoAcao>
        <BotaoAcao onClick={onRotacionar} icon={KeyRound}>
          Gerar novo segredo
        </BotaoAcao>
        {e.status === "ATIVO" ? (
          <BotaoAcao onClick={() => onStatus("DESATIVADO")} icon={Pause}>
            Pausar
          </BotaoAcao>
        ) : (
          <BotaoAcao onClick={() => onStatus("ATIVO")} icon={Play}>
            {e.status === "SUSPENSO" ? "Reativar e reenviar pendentes" : "Reativar"}
          </BotaoAcao>
        )}
        {confirmarExclusao ? (
          <span className="flex items-center gap-2 text-xs">
            <span className="text-ink-300">Excluir este webhook?</span>
            <button type="button" onClick={onExcluir} className="text-red-400 hover:text-red-300 font-medium">
              Excluir
            </button>
            <button type="button" onClick={() => setConfirmarExclusao(false)} className="text-ink-500 hover:text-ink-100">
              Cancelar
            </button>
          </span>
        ) : (
          <BotaoAcao onClick={() => setConfirmarExclusao(true)} icon={Trash2} perigo>
            Excluir
          </BotaoAcao>
        )}
      </div>
    </div>
  );
}

function BotaoAcao({ onClick, icon: Icon, children, disabled, perigo }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-base-700 disabled:opacity-40 ${
        perigo ? "text-ink-500 hover:text-red-400 hover:border-red-500/40" : "text-ink-300 hover:text-ink-100 hover:border-brand-500/60"
      }`}
    >
      <Icon size={13} /> {children}
    </button>
  );
}

function ComoVerificar() {
  return (
    <details className="rounded-2xl border border-base-700 bg-base-900 p-5 group">
      <summary className="cursor-pointer text-sm font-medium flex items-center gap-2">
        <ShieldCheck size={16} className="text-brand-400" /> Como verificar a assinatura no seu sistema
      </summary>
      <div className="mt-4 space-y-3 text-sm text-ink-300">
        <p>
          Cada envio traz <code className="text-xs">X-Webhook-Signature: t=&lt;timestamp&gt;,v1=&lt;hmac&gt;</code>. Recalcule o
          HMAC-SHA256 de <code className="text-xs">timestamp + "." + corpo bruto</code> com o seu segredo, compare em tempo
          constante, recuse envios com mais de 5 minutos e ignore repetidos pelo <code className="text-xs">X-Webhook-Id</code>.
        </p>
        <pre className="rounded-lg bg-base-950 border border-base-700 p-4 text-xs overflow-x-auto">
{`import { createHmac, timingSafeEqual } from "node:crypto";

function webhookValido(segredo, cabecalho, corpoBruto) {
  const partes = cabecalho.split(",").map((p) => p.split("="));
  const t = Number(partes.find(([k]) => k === "t")?.[1]);
  if (Math.abs(Date.now() / 1000 - t) > 300) return false;
  const esperado = createHmac("sha256", segredo).update(\`\${t}.\${corpoBruto}\`).digest();
  return partes
    .filter(([k]) => k === "v1")
    .some(([, v]) => {
      const b = Buffer.from(v, "hex");
      return b.length === esperado.length && timingSafeEqual(b, esperado);
    });
}`}
        </pre>
      </div>
    </details>
  );
}
