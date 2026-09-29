import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  api,
  ApiError,
  setUnauthorizedHandler,
  SESSION_KEY,
  TOKEN_KEY,
} from "../api/client";

const AuthContext = createContext(null);

function mensagemDeErro(e) {
  return e instanceof ApiError ? e.message : "Não foi possível conectar ao servidor.";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { id, nome, cpfMasked } — vem do backend
  const [ready, setReady] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    // Qualquer 401 em rota autenticada derruba a sessão; o ProtectedRoute
    // manda de volta para o login na próxima renderização.
    setUnauthorizedHandler(logout);

    const stored = localStorage.getItem(SESSION_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
        // Confirma no backend que o token ainda vale (expira em 1h por padrão).
        // Se não valer, o client dispara o logout via handler de 401.
        api.get("/auth/me").then(
          (conta) => {
            localStorage.setItem(SESSION_KEY, JSON.stringify(conta));
            setUser(conta);
          },
          () => {},
        );
      } catch {
        logout();
      }
    }
    setReady(true);
  }, [logout]);

  function iniciarSessao(data) {
    localStorage.setItem(TOKEN_KEY, data.accessToken);
    localStorage.setItem(SESSION_KEY, JSON.stringify(data.conta));
    setUser(data.conta);
  }

  async function login(email, senha) {
    try {
      const data = await api.post("/auth/login", { email: email.trim(), senha }, { auth: false });
      iniciarSessao(data);
      return { ok: true };
    } catch (e) {
      return { ok: false, message: mensagemDeErro(e) };
    }
  }

  async function register({ nome, email, cpf, senha }) {
    try {
      const data = await api.post(
        "/auth/register",
        { nome: nome.trim(), email: email.trim(), cpf, senha },
        { auth: false },
      );
      iniciarSessao(data);
      return { ok: true };
    } catch (e) {
      return { ok: false, message: mensagemDeErro(e) };
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
