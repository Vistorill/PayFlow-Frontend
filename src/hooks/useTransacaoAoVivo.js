import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api/client";

// Intervalos do polling: rápido logo depois do envio (o SPI responde em
// segundos), mais espaçado se demorar (reconciliação leva ~30s ou mais).
const RAPIDO_MS = 1200;
const LENTO_MS = 5000;
const TROCA_PARA_LENTO_MS = 20000;

/**
 * Busca GET /transacoes/:id e, enquanto o Pix estiver PENDENTE (aguardando o
 * SPI), consulta de novo até chegar a um estado final. `onFinal` é chamado uma
 * vez quando o Pix sai de PENDENTE (para atualizar saldo/extrato).
 */
export function useTransacaoAoVivo(transacaoId, { onFinal } = {}) {
  const [estado, setEstado] = useState({ loading: true, erro: null, t: null });
  const onFinalRef = useRef(onFinal);
  useEffect(() => {
    onFinalRef.current = onFinal;
  }, [onFinal]);

  const carregar = useCallback(async () => {
    const t = await api.get(`/transacoes/${transacaoId}`);
    setEstado({ loading: false, erro: null, t });
    return t;
  }, [transacaoId]);

  useEffect(() => {
    if (!transacaoId) return undefined;
    let ativo = true;
    let timer;
    const inicio = Date.now();
    let estavaPendente = false;

    async function ciclo() {
      try {
        const t = await carregar();
        if (!ativo) return;
        if (t.status === "PENDENTE") {
          estavaPendente = true;
          const espera = Date.now() - inicio > TROCA_PARA_LENTO_MS ? LENTO_MS : RAPIDO_MS;
          timer = setTimeout(ciclo, espera);
        } else if (estavaPendente) {
          onFinalRef.current?.(t);
        }
      } catch (e) {
        if (ativo) setEstado((s) => ({ ...s, loading: false, erro: e.message }));
      }
    }

    setEstado({ loading: true, erro: null, t: null });
    ciclo();
    return () => {
      ativo = false;
      clearTimeout(timer);
    };
  }, [transacaoId, carregar]);

  return { ...estado, recarregar: carregar };
}
