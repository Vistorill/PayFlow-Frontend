import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "./AuthContext";
import { useWallet } from "./WalletContext";

const NotificacoesContext = createContext(null);

const INTERVALO_MS = 5000;
const DURACAO_AVISO_MS = 7000;

/**
 * Caixa de notificações (GET /api/notificacoes).
 *
 * No app mobile a notificação chega por push (Expo). No navegador não há push:
 * consultamos a caixa a cada 5s e, quando aparece uma nova, mostramos um aviso
 * na tela e atualizamos saldo e extrato. A caixa é a fonte da verdade nos dois.
 */
export function NotificacoesProvider({ children }) {
  const { user } = useAuth();
  const { refresh } = useWallet();
  const [itens, setItens] = useState([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [avisos, setAvisos] = useState([]);
  const [transacaoAberta, setTransacaoAberta] = useState(null);
  const vistas = useRef(null); // ids já conhecidos; null = ainda não carregou

  const carregar = useCallback(async () => {
    const r = await api.get("/notificacoes?take=20");
    setItens(r.itens);
    setNaoLidas(r.naoLidas);

    const novas = vistas.current ? r.itens.filter((n) => !vistas.current.has(n.id) && !n.lidaEm) : [];
    vistas.current = new Set(r.itens.map((n) => n.id));
    if (novas.length) {
      setAvisos((a) => [...novas.reverse(), ...a].slice(0, 3));
      refresh();
    }
  }, [refresh]);

  useEffect(() => {
    if (!user) {
      setItens([]);
      setNaoLidas(0);
      setAvisos([]);
      vistas.current = null;
      return undefined;
    }
    let ativo = true;
    let timer;
    async function ciclo() {
      if (document.visibilityState === "visible") {
        await carregar().catch(() => {});
      }
      if (ativo) timer = setTimeout(ciclo, INTERVALO_MS);
    }
    ciclo();
    return () => {
      ativo = false;
      clearTimeout(timer);
    };
  }, [user, carregar]);

  // Cada aviso some sozinho depois de alguns segundos.
  useEffect(() => {
    if (!avisos.length) return undefined;
    const timer = setTimeout(() => setAvisos((a) => a.slice(0, -1)), DURACAO_AVISO_MS);
    return () => clearTimeout(timer);
  }, [avisos]);

  const fecharAviso = useCallback((id) => setAvisos((a) => a.filter((n) => n.id !== id)), []);

  const marcarLida = useCallback(async (id) => {
    setItens((lista) => lista.map((n) => (n.id === id && !n.lidaEm ? { ...n, lidaEm: new Date().toISOString() } : n)));
    setNaoLidas((q) => Math.max(0, q - 1));
    await api.patch(`/notificacoes/${id}/lida`).catch(() => {});
  }, []);

  const marcarTodas = useCallback(async () => {
    setItens((lista) => lista.map((n) => ({ ...n, lidaEm: n.lidaEm ?? new Date().toISOString() })));
    setNaoLidas(0);
    await api.post("/notificacoes/lidas").catch(() => {});
  }, []);

  /** Abre o comprovante da transação da notificação e marca como lida. */
  const abrir = useCallback(
    (n) => {
      if (!n.lidaEm) marcarLida(n.id);
      fecharAviso(n.id);
      if (n.dados?.transacaoId) setTransacaoAberta(n.dados.transacaoId);
    },
    [marcarLida, fecharAviso],
  );

  return (
    <NotificacoesContext.Provider
      value={{
        itens,
        naoLidas,
        avisos,
        fecharAviso,
        marcarTodas,
        abrir,
        transacaoAberta,
        fecharTransacao: () => setTransacaoAberta(null),
      }}
    >
      {children}
    </NotificacoesContext.Provider>
  );
}

export function useNotificacoes() {
  const ctx = useContext(NotificacoesContext);
  if (!ctx) throw new Error("useNotificacoes deve ser usado dentro de NotificacoesProvider");
  return ctx;
}
