// Cliente HTTP único do app. Toda chamada ao backend passa por aqui:
// base URL, header Authorization, parse de erro e reação a 401.

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export const TOKEN_KEY = "payflow_token";
export const SESSION_KEY = "payflow_session";

export class ApiError extends Error {
  constructor(status, body) {
    super(mensagemDoCorpo(body) || "Erro na requisição");
    this.status = status;
    this.codigo = body?.codigo;
    this.body = body;
  }
}

// Falha de rede (backend fora do ar, CORS, timeout). Separada de ApiError
// porque aqui NÃO sabemos se o servidor processou a requisição.
export class NetworkError extends Error {
  constructor() {
    super("Não foi possível conectar ao servidor.");
  }
}

// O backend devolve dois formatos:
//   - erros de domínio: { codigo, mensagem, ... }
//   - erros padrão do Nest: { statusCode, message, error } (message pode ser array na validação)
function mensagemDoCorpo(body) {
  if (!body) return null;
  if (body.mensagem) return body.mensagem;
  if (Array.isArray(body.message)) return body.message.join(" · ");
  return body.message ?? null;
}

let onUnauthorized = () => {};

// O AuthContext registra aqui o que fazer quando a sessão expira.
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new NetworkError();
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    // 401 em rota autenticada = token ausente/expirado. Em /auth/login (auth: false)
    // é só credencial errada, e a tela de login trata a mensagem.
    if (res.status === 401 && auth) onUnauthorized();
    throw new ApiError(res.status, data);
  }

  return data;
}

export const api = {
  get: (path, opts) => request(path, opts),
  post: (path, body, opts) => request(path, { method: "POST", body, ...opts }),
  delete: (path, opts) => request(path, { method: "DELETE", ...opts }),
};
