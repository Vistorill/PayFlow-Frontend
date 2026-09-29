import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Wallet, Zap, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  // Conta seedada no backend (npm run db:seed): Ana, R$ 1.000,00.
  const [email, setEmail] = useState("ana@email.com");
  const [password, setPassword] = useState("senha1234");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.ok) {
      navigate("/app");
    } else {
      setError(result.message);
    }
  }

  return (
    <div className="min-h-screen bg-base-950 bg-radial-fade text-ink-100 flex flex-col md:flex-row">
      {/* left / brand side */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 py-12 md:py-0">
        <div className="flex items-center gap-2 mb-16">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-700" />
          <div>
            <p className="font-display font-semibold leading-tight">PayFlow</p>
            <p className="text-xs text-ink-500 leading-tight">Sistema de pagamentos</p>
          </div>
        </div>

        <p className="text-brand-400 text-xs font-medium tracking-wide mb-3">
          Carteira e pagamentos
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-semibold leading-[1.1] max-w-md mb-6">
          Saldo, Pix, cartão e crédito em um só lugar
        </h1>
        <p className="text-ink-500 max-w-sm mb-10">
          Abra sua conta digital, receba na hora com Pix e peça crédito
          sob medida para o seu negócio crescer.
        </p>

        <div className="space-y-4 max-w-sm hidden md:block">
          <Feature icon={Zap} text="Pix e transferências em segundos" />
          <Feature icon={Wallet} text="Cartão pré-pago, débito e crédito em um só plástico" />
          <Feature icon={ShieldCheck} text="Instituição autorizada, seus dados protegidos" />
        </div>
      </div>

      {/* right / form side */}
      <div className="flex items-center justify-center px-6 pb-12 md:pb-0 md:px-16">
        <div className="w-full max-w-sm rounded-2xl border border-base-700 bg-base-900/80 backdrop-blur p-8 shadow-card">
          <h2 className="font-display text-2xl font-semibold mb-1">Entrar</h2>
          <p className="text-sm text-ink-500 mb-6">
            Acesse sua conta PayFlow para carteira, pagamentos e dashboard.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-field text-base-950 placeholder:text-base-600 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="voce@email.com"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-ink-300">Senha</label>
                <button
                  type="button"
                  className="text-xs text-brand-400 hover:text-brand-300"
                  onClick={() => alert("Fluxo de recuperação de senha — apenas demonstração.")}
                >
                  Esqueci a senha
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg bg-field text-base-950 placeholder:text-base-600 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500 pr-16"
                  placeholder="••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-brand-600 flex items-center gap-1"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
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
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </form>

          <p className="text-xs text-ink-500 mt-6 text-center">
            Ainda não tem conta?{" "}
            <Link to="/cadastro" className="text-brand-400 hover:text-brand-300">
              Abrir conta
            </Link>
          </p>

          <div className="mt-6 pt-5 border-t border-base-700">
            <p className="text-[11px] text-ink-500">
              Demo — conta de teste já preenchida (ana@email.com / senha1234).
              Para testar Pix, use uma chave do Bruno: CPF 123.456.789-09,
              e-mail bruno@email.com ou celular (11) 97777-2222.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 shrink-0 rounded-lg bg-base-850 border border-base-700 flex items-center justify-center text-brand-400">
        <Icon size={17} />
      </div>
      <p className="text-sm text-ink-300">{text}</p>
    </div>
  );
}
