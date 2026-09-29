import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "../api/client";

// Mensagens por `codigo` do backend (POST /contatos).
const MENSAGENS = {
  CHAVE_INVALIDA: "Chave inválida para o tipo escolhido.",
  CHAVE_NAO_ENCONTRADA: "Nenhuma conta PayFlow usa esta chave.",
  CONTATO_PROPRIA_CONTA: "Esta chave é da sua própria conta.",
  CONTATO_JA_EXISTE: "Esta chave já está nos seus contatos.",
};

export function mensagemContato(e) {
  if (e instanceof ApiError) return MENSAGENS[e.codigo] ?? e.message;
  return e?.message ?? "Erro inesperado.";
}

/** Agenda de contatos Pix da conta logada (GET/POST/DELETE /api/contatos). */
export function useContatos() {
  const [contatos, setContatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      setContatos(await api.get("/contatos"));
      setErro(null);
    } catch (e) {
      setErro(mensagemContato(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // nomeFavorecido/banco só são usados quando a chave é de OUTRO banco.
  async function criar({ tipoChave, chave, apelido, nomeFavorecido, banco }) {
    try {
      const novo = await api.post("/contatos", {
        tipoChave,
        chave,
        ...(apelido?.trim() ? { apelido: apelido.trim() } : {}),
        ...(nomeFavorecido?.trim() ? { nomeFavorecido: nomeFavorecido.trim() } : {}),
        ...(banco ? { banco } : {}),
      });
      setContatos((lista) =>
        [...lista, novo].sort((a, b) => a.destino.nome.localeCompare(b.destino.nome, "pt-BR")),
      );
      return { ok: true, contato: novo };
    } catch (e) {
      return {
        ok: false,
        codigo: e.codigo,
        podeSalvarExterno: Boolean(e.body?.podeSalvarExterno),
        message: mensagemContato(e),
      };
    }
  }

  async function remover(id) {
    try {
      await api.delete(`/contatos/${id}`);
      setContatos((lista) => lista.filter((c) => c.id !== id));
      return { ok: true };
    } catch (e) {
      return { ok: false, message: mensagemContato(e) };
    }
  }

  return { contatos, loading, erro, criar, remover, recarregar: carregar };
}
