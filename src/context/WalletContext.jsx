import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, ApiError, NetworkError } from "../api/client";
import { useAuth } from "./AuthContext";

const WalletContext = createContext(null);

// O front NUNCA calcula saldo nem decide se um Pix é válido: saldo e ledger
// vêm prontos do backend, e toda regra de negócio (saldo suficiente,
// idempotência, destino ≠ origem) é validada lá.

function paraEntrada(l) {
  // valor chega como string ("50.00") — só vira number aqui, para exibir.
  const valor = Number(l.valor);
  return {
    id: l.id,
    transacaoId: l.transacaoId,
    date: l.createdAt,
    desc: l.descricao,
    tipo: l.tipo,
    value: l.tipo === "CREDITO" ? valor : -valor,
    tipoTransacao: l.tipoTransacao,
    tipoChave: l.tipoChave,
    chave: l.chaveDestino,
    // Status da transação dona do lançamento: PENDENTE = Pix aguardando o
    // banco de destino; statusSpi detalha (LIQUIDADO, REJEITADO, DEVOLVIDO...).
    statusTransacao: l.statusTransacao,
    statusSpi: l.statusSpi,
  };
}

export function WalletProvider({ children }) {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [ledger, setLedger] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [saldo, extrato] = await Promise.all([
        api.get("/contas/me"),
        api.get(`/contas/${user.id}/extrato?take=100&skip=0`),
      ]);
      setBalance(Number(saldo.saldo));
      setLedger(extrato.lancamentos.map(paraEntrada));
      setTotal(extrato.total);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refresh();
    } else {
      setBalance(0);
      setLedger([]);
      setTotal(0);
    }
  }, [user, refresh]);

  /**
   * @param idempotencyKey gerada pela TELA, uma por tentativa de transferência.
   *   Se a tentativa falhar por rede, a tela reenvia com a MESMA chave — é isso
   *   que garante que um retry nunca debita duas vezes.
   */
  async function sendPix({ tipoChave = "CPF", key, value, idempotencyKey }) {
    try {
      const resultado = await api.post("/pix/transferir", {
        tipoChave,
        chaveDestino: key,
        valor: value,
        idempotencyKey,
      });
      setBalance(Number(resultado.saldoOrigem));
      refresh();
      return { ok: true, resultado };
    } catch (e) {
      if (e instanceof ApiError) {
        return { ok: false, status: e.status, codigo: e.codigo, message: e.message, body: e.body };
      }
      if (e instanceof NetworkError) {
        return { ok: false, network: true, message: e.message };
      }
      return { ok: false, message: "Erro inesperado." };
    }
  }

  return (
    <WalletContext.Provider value={{ balance, ledger, total, loading, error, sendPix, refresh }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet deve ser usado dentro de WalletProvider");
  return ctx;
}
