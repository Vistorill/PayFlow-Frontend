import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatarCpf, isCpfValido } from "../utils/cpf";

const inputClass =
  "w-full rounded-lg bg-field text-base-950 placeholder:text-base-600 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500";

export default function Cadastro() {
  const [form, setForm] = useState({ nome: "", email: "", cpf: "", senha: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  function set(campo) {
    return (e) => {
      const v = campo === "cpf" ? formatarCpf(e.target.value) : e.target.value;
      setForm((f) => ({ ...f, [campo]: v }));
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Pré-validação de UX. O backend valida tudo de novo (é ele quem decide).
    if (!isCpfValido(form.cpf)) {
      setError("CPF inválido — confira os dígitos.");
      return;
    }
    if (form.senha.length < 8 || form.senha.length > 72) {
      setError("A senha deve ter entre 8 e 72 caracteres.");
      return;
    }

    setLoading(true);
    const result = await register(form);
    setLoading(false);
    if (result.ok) {
      navigate("/app");
    } else {
      setError(result.message);
    }
  }

  return (
    <div className="min-h-screen bg-base-950 bg-radial-fade text-ink-100 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-base-700 bg-base-900/80 backdrop-blur p-8 shadow-card">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-700" />
          <div>
            <p className="font-display font-semibold leading-tight">PayFlow</p>
            <p className="text-xs text-ink-500 leading-tight">Sistema de pagamentos</p>
          </div>
        </div>

        <h2 className="font-display text-2xl font-semibold mb-1">Abrir conta</h2>
        <p className="text-sm text-ink-500 mb-6">
          Seu CPF será também sua chave Pix para receber transferências.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink-300 mb-1.5">Nome completo</label>
            <input value={form.nome} onChange={set("nome")} className={inputClass} required minLength={3} maxLength={120} />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-300 mb-1.5">CPF</label>
            <input
              value={form.cpf}
              onChange={set("cpf")}
              className={inputClass}
              placeholder="000.000.000-00"
              inputMode="numeric"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-300 mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={set("email")} className={inputClass} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-300 mb-1.5">Senha</label>
            <input
              type="password"
              value={form.senha}
              onChange={set("senha")}
              className={inputClass}
              placeholder="mínimo 8 caracteres"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-60 transition-colors text-white font-medium py-2.5 text-sm"
          >
            {loading ? "Criando conta…" : "Criar conta"}
          </button>
        </form>

        <p className="text-xs text-ink-500 mt-6 text-center">
          Já tem conta?{" "}
          <Link to="/login" className="text-brand-400 hover:text-brand-300">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
