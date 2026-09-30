import { useEffect, useRef, useState } from "react";
import { Bell, X, ArrowDownRight, ArrowUpRight, AlertTriangle, RotateCcw, Clock } from "lucide-react";
import { useNotificacoes } from "../context/NotificacoesContext";
import TransacaoDetalhe from "./TransacaoDetalhe";

// Ícone e cor por tipo de evento.
function visual(tipo) {
  if (tipo === "pix.payment.received" || tipo === "pix.return.received")
    return { Icon: ArrowDownRight, cls: "bg-mint-400/10 text-mint-400" };
  if (tipo === "pix.payment.rejected" || tipo === "pix.return.rejected")
    return { Icon: AlertTriangle, cls: "bg-red-500/10 text-red-400" };
  if (tipo === "pix.return.settled") return { Icon: RotateCcw, cls: "bg-sky-500/10 text-sky-300" };
  if (tipo === "pix.payment.timeout") return { Icon: Clock, cls: "bg-amber-500/10 text-amber-300" };
  return { Icon: ArrowUpRight, cls: "bg-brand-500/10 text-brand-400" };
}

const quando = (iso) => {
  const seg = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seg < 60) return "agora";
  if (seg < 3600) return `há ${Math.floor(seg / 60)} min`;
  if (seg < 86400) return `há ${Math.floor(seg / 3600)} h`;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
};

/** Sino com contador e lista das notificações recentes. */
export function SinoNotificacoes() {
  const { itens, naoLidas, marcarTodas, abrir } = useNotificacoes();
  const [aberto, setAberto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!aberto) return undefined;
    const fora = (e) => ref.current && !ref.current.contains(e.target) && setAberto(false);
    const esc = (e) => e.key === "Escape" && setAberto(false);
    document.addEventListener("mousedown", fora);
    window.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fora);
      window.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        className="relative h-9 w-9 rounded-full flex items-center justify-center text-ink-300 hover:text-ink-100 hover:bg-base-800"
        aria-label={naoLidas ? `Notificações: ${naoLidas} não lidas` : "Notificações"}
        aria-expanded={aberto}
      >
        <Bell size={18} />
        {naoLidas > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-500 text-white text-[10px] font-semibold flex items-center justify-center tabular-nums">
            {naoLidas > 9 ? "9+" : naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <div className="absolute right-0 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-base-700 bg-base-900 shadow-card z-40">
          <div className="flex items-center justify-between px-4 py-3 border-b border-base-800">
            <p className="font-display font-semibold text-sm">Notificações</p>
            {naoLidas > 0 && (
              <button type="button" onClick={marcarTodas} className="text-xs text-brand-300 hover:text-brand-400">
                Marcar todas como lidas
              </button>
            )}
          </div>
          <ul className="max-h-96 overflow-y-auto divide-y divide-base-800">
            {itens.length === 0 && (
              <li className="px-4 py-6 text-sm text-ink-500 text-center">
                Nenhuma notificação ainda. Quando um Pix for concluído, recebido ou devolvido, ele aparece aqui.
              </li>
            )}
            {itens.map((n) => {
              const { Icon, cls } = visual(n.tipo);
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => {
                      abrir(n);
                      setAberto(false);
                    }}
                    className="w-full text-left px-4 py-3 flex gap-3 hover:bg-base-850"
                  >
                    <span className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center ${cls}`}>
                      <Icon size={15} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className={`text-sm ${n.lidaEm ? "text-ink-300" : "font-medium"}`}>{n.titulo}</span>
                        <span className="text-[11px] text-ink-500 shrink-0">{quando(n.createdAt)}</span>
                      </span>
                      <span className="block text-xs text-ink-500">{n.corpo}</span>
                    </span>
                    {!n.lidaEm && <span className="mt-1.5 h-2 w-2 rounded-full bg-brand-400 shrink-0" aria-label="não lida" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Avisos no canto da tela quando chega notificação nova, e o comprovante aberto por eles. */
export function AvisosNotificacao() {
  const { avisos, fecharAviso, abrir, transacaoAberta, fecharTransacao } = useNotificacoes();

  return (
    <>
      <div className="fixed z-50 right-4 bottom-20 md:bottom-6 flex flex-col gap-2 w-[min(22rem,calc(100vw-2rem))]" aria-live="polite">
        {avisos.map((n) => {
          const { Icon, cls } = visual(n.tipo);
          return (
            <div
              key={n.id}
              className="rounded-xl border border-base-700 bg-base-900 shadow-card px-4 py-3 flex gap-3 items-start"
            >
              <span className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center ${cls}`}>
                <Icon size={15} />
              </span>
              <button type="button" onClick={() => abrir(n)} className="min-w-0 flex-1 text-left">
                <span className="block text-sm font-medium">{n.titulo}</span>
                <span className="block text-xs text-ink-500">{n.corpo}</span>
                <span className="block text-[11px] text-brand-300 mt-1">Ver comprovante</span>
              </button>
              <button
                type="button"
                onClick={() => fecharAviso(n.id)}
                className="text-ink-500 hover:text-ink-100"
                aria-label="Fechar aviso"
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
      {transacaoAberta && <TransacaoDetalhe transacaoId={transacaoAberta} onClose={fecharTransacao} />}
    </>
  );
}
