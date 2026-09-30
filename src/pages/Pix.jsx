import { useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Send, CheckCircle2, KeyRound, AlertTriangle, BookUser, UserRound, Landmark, XCircle, Loader2 } from "lucide-react";
import { useWallet } from "../context/WalletContext";
import { useTransacaoAoVivo } from "../hooks/useTransacaoAoVivo";
import LinhaDoTempoSpi from "../components/LinhaDoTempoSpi";
import TransacaoDetalhe from "../components/TransacaoDetalhe";
import { descricaoMotivo } from "../utils/spi";
import { useContatos } from "../hooks/useContatos";
import { novaIdempotencyKey } from "../utils/idempotencia";
import { TIPOS_CHAVE } from "../utils/chavePix";

const ROTULO_TIPO = { CPF: "CPF", EMAIL: "E-mail", TELEFONE: "Celular" };

const currency = (v) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Mensagens por `codigo` do backend — não pelo texto, que pode mudar.
const MENSAGENS = {
  SALDO_INSUFICIENTE: "Saldo insuficiente para esta transferência.",
  DESTINO_IGUAL_ORIGEM: "Não é possível transferir para você mesmo.",
  TRANSACAO_EM_PROCESSAMENTO:
    "Sua transferência anterior ainda está sendo processada. Aguarde e tente novamente.",
  CHAVE_INVALIDA: "Chave Pix inválida para o tipo escolhido.",
  CHAVE_NAO_ENCONTRADA:
    "Chave não encontrada no PayFlow. Se ela for de outro banco, salve-a em Contatos (com o nome do favorecido) para poder pagar.",
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
  const { contatos, loading: carregandoContatos, criar: criarContato } = useContatos();
  const [searchParams] = useSearchParams();
  // "contato" = escolher da agenda; "manual" = digitar a chave.
  // null até o usuário escolher: aí o padrão depende de haver contatos salvos.
  const [modoEscolhido, setModoEscolhido] = useState(searchParams.get("contato") ? "contato" : null);
  const [contatoId, setContatoId] = useState(searchParams.get("contato") ?? "");
  const [salvarContato, setSalvarContato] = useState(false);
  const [tipoChave, setTipoChave] = useState(TIPOS_CHAVE[0]);
  const [pixKey, setPixKey] = useState("");
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [comprovante, setComprovante] = useState(null);

  // Uma chave por TENTATIVA de transferência. Sobrevive a retries (falha de
  // rede / 409 em processamento) e só é descartada quando a tentativa termina
  // de forma definitiva ou quando o usuário muda o destino/valor.
  const idempotencyKeyRef = useRef(null);

  function novaIntencao() {
    idempotencyKeyRef.current = null;
  }

  const modo = modoEscolhido ?? (!carregandoContatos && contatos.length > 0 ? "contato" : "manual");
  const contato = contatos.find((c) => c.id === contatoId) ?? null;

  function trocarModo(novo) {
    if (novo === modo) return;
    setModoEscolhido(novo);
    setFeedback(null);
    novaIntencao();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return; // clique duplo não gera duas requisições
    setFeedback(null);

    // O destino sai do contato salvo OU do que foi digitado. Em ambos os casos
    // o backend recebe tipoChave + chave e resolve o dono de novo.
    let destino;
    if (modo === "contato") {
      if (!contato) {
        setFeedback({ ok: false, message: "Escolha um contato." });
        return;
      }
      destino = { tipoChave: contato.tipoChave, key: contato.chave };
    } else {
      if (!tipoChave.validar(pixKey)) {
        setFeedback({ ok: false, message: tipoChave.erro });
        return;
      }
      destino = { tipoChave: tipoChave.id, key: pixKey };
    }
    const valor = normalizarValor(value);
    if (!/^\d+(\.\d{1,2})?$/.test(valor) || Number(valor) <= 0) {
      setFeedback({ ok: false, message: "Informe um valor maior que zero, com até 2 casas decimais." });
      return;
    }

    if (!idempotencyKeyRef.current) idempotencyKeyRef.current = novaIdempotencyKey();
    const idempotencyKey = idempotencyKeyRef.current;

    setLoading(true);
    const result = await sendPix({ ...destino, value: valor, idempotencyKey });

    if (result.ok) {
      novaIntencao();
      let contatoSalvo = null;
      if (modo === "manual" && salvarContato) {
        const c = await criarContato({ tipoChave: destino.tipoChave, chave: destino.key });
        contatoSalvo = c.ok ? "salvo" : c.codigo === "CONTATO_JA_EXISTE" ? "existente" : null;
      }
      setLoading(false);
      setFeedback({ ok: true, resultado: result.resultado, contatoSalvo });
      setPixKey("");
      setValue("");
      setSalvarContato(false);
      return;
    }
    setLoading(false);

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
        <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-base-850 border border-base-700">
          {[
            { id: "contato", label: "Meus contatos", icon: BookUser },
            { id: "manual", label: "Digitar chave", icon: KeyRound },
          ].map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              key={id}
              onClick={() => trocarModo(id)}
              className={`flex items-center justify-center gap-2 text-sm py-2 rounded-md transition-colors ${
                modo === id ? "bg-brand-500/20 text-brand-300 font-medium" : "text-ink-500 hover:text-ink-100"
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {modo === "contato" && (
          <div className="space-y-3">
            <div>
              <label htmlFor="contato" className="block text-xs font-medium text-ink-300 mb-1.5">
                Contato
              </label>
              <select
                id="contato"
                value={contatoId}
                onChange={(e) => {
                  setContatoId(e.target.value);
                  setFeedback(null);
                  novaIntencao();
                }}
                disabled={carregandoContatos || contatos.length === 0}
                className="w-full rounded-lg bg-field text-base-950 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
              >
                <option value="">
                  {carregandoContatos
                    ? "Carregando contatos…"
                    : contatos.length === 0
                      ? "Nenhum contato salvo"
                      : "Selecione um contato"}
                </option>
                {contatos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.apelido ? `${c.apelido} (${c.destino.nome})` : c.destino.nome} — {ROTULO_TIPO[c.tipoChave]}:{" "}
                    {c.chave}
                    {c.destino.externo ? ` · ${c.destino.banco ?? "outro banco"}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {contato && (
              <div className="rounded-xl border border-base-700 bg-base-850 px-4 py-3 flex items-center gap-3">
                <div
                  className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center ${
                    contato.destino.externo ? "bg-amber-500/10 text-amber-300" : "bg-brand-500/10 text-brand-400"
                  }`}
                >
                  {contato.destino.externo ? <Landmark size={16} /> : <UserRound size={16} />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{contato.destino.nome}</p>
                  <p className="text-xs text-ink-500 truncate">
                    {ROTULO_TIPO[contato.tipoChave]}: {contato.chave} ·{" "}
                    {contato.destino.externo ? (
                      <span className="text-amber-300">{contato.destino.banco ?? "Outro banco"} · Pix para outro banco</span>
                    ) : (
                      <>CPF {contato.destino.cpf}</>
                    )}
                  </p>
                </div>
              </div>
            )}

            <p className="text-xs text-ink-500">
              {contatos.length === 0 && !carregandoContatos ? "Você ainda não tem contatos. " : ""}
              <Link to="/app/contatos" className="text-brand-400 hover:text-brand-300">
                Gerenciar contatos
              </Link>
            </p>
          </div>
        )}

        {modo === "manual" && (
        <>
        <div>
          <label className="block text-xs font-medium text-ink-300 mb-2">Tipo de chave</label>
          <div className="flex flex-wrap gap-2">
            {TIPOS_CHAVE.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => {
                  if (t.id === tipoChave.id) return;
                  setTipoChave(t);
                  setPixKey("");
                  setFeedback(null);
                  novaIntencao();
                }}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  tipoChave.id === t.id
                    ? "border-brand-500 bg-brand-500/15 text-brand-300"
                    : "border-base-700 text-ink-500 hover:text-ink-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-ink-300 mb-1.5">
            Chave Pix do destinatário ({tipoChave.label.toLowerCase()})
          </label>
          <div className="relative">
            <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-600" />
            <input
              value={pixKey}
              onChange={(e) => {
                setPixKey(tipoChave.formatar(e.target.value));
                novaIntencao();
              }}
              placeholder={tipoChave.placeholder}
              inputMode={tipoChave.inputMode}
              type={tipoChave.id === "EMAIL" ? "email" : "text"}
              className="w-full rounded-lg bg-field text-base-950 placeholder:text-base-600 pl-9 pr-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs text-ink-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={salvarContato}
            onChange={(e) => setSalvarContato(e.target.checked)}
            className="accent-brand-500"
          />
          Salvar esta chave nos meus contatos após o envio
        </label>
        </>
        )}

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
        {r && r.statusSpi && <AcompanhamentoPix r={r} onVerComprovante={() => setComprovante(r.id)} />}
        {r && !r.statusSpi && (
          <div className="text-sm text-mint-400 bg-mint-400/10 border border-mint-400/20 rounded-lg px-3 py-2.5 space-y-1">
            <p className="flex items-center gap-2 font-medium">
              <CheckCircle2 size={15} /> Pix de {currency(Number(r.valor))} enviado para {r.destino.nome}
              {r.destino.externo ? ` (${r.destino.banco ?? "outro banco"})` : ""}.
            </p>
            {r.chaveDestino && (
              <p className="text-xs text-ink-300">
                Chave {({ CPF: "CPF", EMAIL: "E-mail", TELEFONE: "Celular" })[r.tipoChave]}: {r.chaveDestino}
              </p>
            )}
            <p className="text-xs text-ink-500">
              Novo saldo: {currency(Number(r.saldoOrigem))} · status {r.status}
            </p>
            {feedback.contatoSalvo === "salvo" && (
              <p className="text-xs text-ink-300">Chave salva nos seus contatos.</p>
            )}
            {feedback.contatoSalvo === "existente" && (
              <p className="text-xs text-ink-500">Esta chave já estava nos seus contatos.</p>
            )}
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
          debita duas vezes. Pix para outro banco segue pelo SPI (pacs.008) e
          a resposta do banco de destino (pacs.002) aparece aqui em segundos.
        </p>
      </form>

      {comprovante && <TransacaoDetalhe transacaoId={comprovante} onClose={() => setComprovante(null)} />}
    </div>
  );
}

/**
 * Pix para outro banco: a API responde 202 (valor já reservado) e o resultado
 * chega depois, quando o banco de destino responde pelo SPI. Esta caixa
 * acompanha o status ao vivo até o fim.
 */
function AcompanhamentoPix({ r, onVerComprovante }) {
  const { refresh } = useWallet();
  const { t } = useTransacaoAoVivo(r.id, { onFinal: refresh });
  const statusSpi = t?.statusSpi ?? r.statusSpi;
  const status = t?.status ?? r.status;
  const favorecido = `${r.destino.nome} (${r.destino.banco ?? "outro banco"})`;

  const tom =
    status === "FALHA"
      ? "border-red-500/20 bg-red-500/10"
      : status === "CONCLUIDA"
        ? "border-mint-400/20 bg-mint-400/10"
        : "border-amber-500/30 bg-amber-500/10";

  return (
    <div className={`rounded-lg border px-4 py-3 space-y-3 ${tom}`}>
      <p className="flex items-center gap-2 text-sm font-medium">
        {status === "CONCLUIDA" && <CheckCircle2 size={15} className="text-mint-400" />}
        {status === "FALHA" && <XCircle size={15} className="text-red-400" />}
        {status === "PENDENTE" && <Loader2 size={15} className="text-amber-300 animate-spin" />}
        {status === "CONCLUIDA" && <>Pix de {currency(Number(r.valor))} concluído para {favorecido}.</>}
        {status === "FALHA" && <>Pix de {currency(Number(r.valor))} para {favorecido} foi recusado.</>}
        {status === "PENDENTE" && <>Enviando {currency(Number(r.valor))} para {favorecido}…</>}
      </p>

      <LinhaDoTempoSpi statusSpi={statusSpi} />

      {status === "FALHA" && (
        <p className="text-xs text-ink-300">
          {descricaoMotivo(t?.motivoRejeicao)}. O valor voltou para a sua conta.
        </p>
      )}
      {status === "PENDENTE" && (
        <p className="text-xs text-ink-500">
          O valor já saiu do seu saldo e está reservado. Você pode sair desta tela: avisaremos quando o banco de
          destino responder.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-ink-500 font-mono break-all">EndToEndId: {r.endToEndId}</p>
        <button type="button" onClick={onVerComprovante} className="text-xs text-brand-300 hover:text-brand-400">
          Ver comprovante
        </button>
      </div>
    </div>
  );
}
