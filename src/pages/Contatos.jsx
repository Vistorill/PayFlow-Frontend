import { useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound, Plus, Trash2, Send, UserRound, CheckCircle2, AlertTriangle, Landmark, Info } from "lucide-react";
import { useContatos } from "../hooks/useContatos";
import { BANCOS, TIPOS_CHAVE } from "../utils/chavePix";

const ROTULO_TIPO = Object.fromEntries(TIPOS_CHAVE.map((t) => [t.id, t.label]));

const inputClass =
  "w-full rounded-lg bg-field text-base-950 placeholder:text-base-600 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500";

export default function Contatos() {
  const { contatos, loading, erro, criar, remover } = useContatos();
  const [tipo, setTipo] = useState(TIPOS_CHAVE[0]);
  const [chave, setChave] = useState("");
  const [apelido, setApelido] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [confirmarRemocao, setConfirmarRemocao] = useState(null); // id
  // Chave que não é de cliente PayFlow: pede favorecido + banco (Pix externo).
  const [externo, setExterno] = useState(false);
  const [nomeFavorecido, setNomeFavorecido] = useState("");
  const [banco, setBanco] = useState(BANCOS[0]);

  function limparExterno() {
    setExterno(false);
    setNomeFavorecido("");
    setBanco(BANCOS[0]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFeedback(null);
    if (!tipo.validar(chave)) {
      setFeedback({ ok: false, message: tipo.erro });
      return;
    }
    if (externo && nomeFavorecido.trim().length < 3) {
      setFeedback({ ok: false, message: "Informe o nome do favorecido (mínimo 3 letras)." });
      return;
    }
    setSalvando(true);
    const r = await criar({
      tipoChave: tipo.id,
      chave,
      apelido,
      ...(externo ? { nomeFavorecido, banco } : {}),
    });
    setSalvando(false);
    if (r.ok) {
      const onde = r.contato.destino.externo ? ` (${r.contato.destino.banco ?? "outro banco"})` : "";
      setFeedback({ ok: true, message: `${r.contato.destino.nome}${onde} foi adicionado aos seus contatos.` });
      setChave("");
      setApelido("");
      limparExterno();
    } else if (r.podeSalvarExterno && !externo) {
      setExterno(true);
      setFeedback({
        info: true,
        message:
          "Esta chave não é de um cliente PayFlow. Se ela for de outro banco, informe o favorecido abaixo e salve de novo.",
      });
    } else {
      setFeedback({ ok: false, message: r.message });
    }
  }

  async function handleRemover(id) {
    const r = await remover(id);
    setConfirmarRemocao(null);
    if (!r.ok) setFeedback({ ok: false, message: r.message });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-semibold">Contatos Pix</h1>
        <p className="text-sm text-ink-500 mt-1">
          Salve as chaves de quem você paga com frequência e escolha direto na tela de Pix.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-base-700 bg-base-900 p-6 space-y-4">
        <h2 className="font-display font-semibold flex items-center gap-2">
          <Plus size={16} /> Novo contato
        </h2>

        <div className="flex flex-wrap gap-2">
          {TIPOS_CHAVE.map((t) => (
            <button
              type="button"
              key={t.id}
              onClick={() => {
                setTipo(t);
                setChave("");
                setFeedback(null);
                limparExterno();
              }}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                tipo.id === t.id
                  ? "border-brand-500 bg-brand-500/15 text-brand-300"
                  : "border-base-700 text-ink-500 hover:text-ink-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink-300 mb-1.5">Chave ({tipo.label.toLowerCase()})</label>
            <input
              value={chave}
              onChange={(e) => {
                setChave(tipo.formatar(e.target.value));
                if (externo) {
                  limparExterno();
                  setFeedback(null);
                }
              }}
              placeholder={tipo.placeholder}
              inputMode={tipo.inputMode}
              type={tipo.id === "EMAIL" ? "email" : "text"}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-300 mb-1.5">
              Apelido <span className="text-ink-500 font-normal">(opcional)</span>
            </label>
            <input
              value={apelido}
              onChange={(e) => setApelido(e.target.value)}
              placeholder="Ex.: Bruno — aluguel"
              maxLength={60}
              className={inputClass}
            />
          </div>
        </div>

        {externo && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
            <p className="text-xs font-medium text-amber-300 flex items-center gap-2">
              <Landmark size={14} /> Chave de outro banco
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-ink-300 mb-1.5">Nome do favorecido</label>
                <input
                  value={nomeFavorecido}
                  onChange={(e) => setNomeFavorecido(e.target.value)}
                  placeholder="Nome completo de quem vai receber"
                  maxLength={120}
                  className={inputClass}
                  autoFocus
                  required
                />
              </div>
              <div>
                <label htmlFor="banco" className="block text-xs font-medium text-ink-300 mb-1.5">
                  Banco
                </label>
                <select id="banco" value={banco} onChange={(e) => setBanco(e.target.value)} className={inputClass}>
                  {BANCOS.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-[11px] text-ink-500">
              Sem acesso ao DICT do Bacen, o PayFlow não consegue confirmar o dono de chaves de outros
              bancos — confira o nome antes de salvar.
            </p>
          </div>
        )}

        {feedback && (
          <p
            className={`text-sm rounded-lg px-3 py-2 flex items-start gap-2 border ${
              feedback.ok
                ? "text-mint-400 bg-mint-400/10 border-mint-400/20"
                : feedback.info
                  ? "text-amber-300 bg-amber-500/10 border-amber-500/30"
                  : "text-red-400 bg-red-500/10 border-red-500/20"
            }`}
          >
            {feedback.ok ? (
              <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
            ) : feedback.info ? (
              <Info size={15} className="mt-0.5 shrink-0" />
            ) : (
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            )}
            {feedback.message}
          </p>
        )}

        <button
          type="submit"
          disabled={salvando}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-60 transition-colors text-white font-medium px-4 py-2.5 text-sm"
        >
          <Plus size={15} />
          {salvando ? "Verificando chave…" : externo ? "Salvar contato de outro banco" : "Salvar contato"}
        </button>
        <p className="text-[11px] text-ink-500">
          Chaves de clientes PayFlow são confirmadas pelo backend, que mostra o nome do dono. Chaves de
          outros bancos são salvas com o favorecido que você informar.
        </p>
      </form>

      <div className="rounded-2xl border border-base-700 bg-base-900">
        <div className="px-6 py-4 border-b border-base-800 flex items-center justify-between">
          <h2 className="font-display font-semibold">Meus contatos</h2>
          <span className="text-xs text-ink-500">{contatos.length}</span>
        </div>

        {loading && <p className="p-6 text-sm text-ink-500">Carregando…</p>}
        {erro && <p className="p-6 text-sm text-red-400">{erro}</p>}
        {!loading && !erro && contatos.length === 0 && (
          <p className="p-6 text-sm text-ink-500">Nenhum contato salvo ainda.</p>
        )}

        <ul className="divide-y divide-base-800">
          {contatos.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 px-6 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center ${
                    c.destino.externo ? "bg-amber-500/10 text-amber-300" : "bg-brand-500/10 text-brand-400"
                  }`}
                >
                  {c.destino.externo ? <Landmark size={16} /> : <UserRound size={16} />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {c.apelido || c.destino.nome}
                    {c.apelido && <span className="text-ink-500 font-normal"> · {c.destino.nome}</span>}
                  </p>
                  <p className="text-xs text-ink-500 flex items-center gap-1.5 truncate">
                    <KeyRound size={11} /> {ROTULO_TIPO[c.tipoChave]}: {c.chave} ·{" "}
                    {c.destino.externo ? (
                      <span className="text-amber-300">{c.destino.banco ?? "Outro banco"}</span>
                    ) : (
                      <>CPF {c.destino.cpf}</>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {confirmarRemocao === c.id ? (
                  <>
                    <button
                      onClick={() => handleRemover(c.id)}
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30"
                    >
                      Remover
                    </button>
                    <button
                      onClick={() => setConfirmarRemocao(null)}
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-base-700 text-ink-500"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to={`/app/pix?contato=${c.id}`}
                      className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white"
                    >
                      <Send size={12} /> Pix
                    </Link>
                    <button
                      onClick={() => setConfirmarRemocao(c.id)}
                      className="p-1.5 rounded-lg text-ink-500 hover:text-red-400 hover:bg-base-800"
                      aria-label={`Remover ${c.apelido || c.destino.nome}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
