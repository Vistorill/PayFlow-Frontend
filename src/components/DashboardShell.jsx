import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  CreditCard,
  Receipt,
  BookUser,
  LogOut,
  Webhook,
  FlaskConical,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { SinoNotificacoes, AvisosNotificacao } from "./Notificacoes";

// O simulador do SPI só existe em desenvolvimento/demo.
const MOSTRAR_SIMULADOR = import.meta.env.VITE_MOSTRAR_SIMULADOR !== "false";

// `principal` = aparece na barra inferior do celular; os demais ficam no menu.
const nav = [
  { to: "/app", label: "Visão geral", icon: LayoutDashboard, end: true, principal: true },
  { to: "/app/pix", label: "Pix", icon: ArrowLeftRight, principal: true },
  { to: "/app/contatos", label: "Contatos", icon: BookUser, principal: true },
  { to: "/app/cartao", label: "Cartão", icon: CreditCard, principal: true },
  { to: "/app/extrato", label: "Extrato", icon: Receipt, principal: true },
  { to: "/app/webhooks", label: "Webhooks", icon: Webhook },
  ...(MOSTRAR_SIMULADOR ? [{ to: "/app/simulador", label: "Simulador SPI", icon: FlaskConical }] : []),
];

export default function DashboardShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-base-950 text-ink-100 flex">
      <aside className="w-64 shrink-0 border-r border-base-700 bg-base-900 flex flex-col justify-between py-6 px-4 hidden md:flex">
        <div>
          <div className="flex items-center gap-2 px-2 mb-10">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-700" />
            <div>
              <p className="font-display font-semibold leading-tight">PayFlow</p>
              <p className="text-xs text-ink-500 leading-tight">Sistema de pagamentos</p>
            </div>
          </div>

          <nav className="space-y-1">
            {nav.map(({ to, label, icon: Icon, end, principal }, i) => (
              <div key={to}>
                {!principal && nav[i - 1]?.principal && (
                  <p className="px-3 pt-5 pb-1 text-[10px] uppercase tracking-wider text-ink-700">Integrações</p>
                )}
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      isActive
                        ? "bg-brand-500/15 text-brand-300 font-medium"
                        : "text-ink-500 hover:text-ink-100 hover:bg-base-800"
                    }`
                  }
                >
                  <Icon size={18} strokeWidth={2} />
                  {label}
                </NavLink>
              </div>
            ))}
          </nav>
        </div>

        <div className="px-2">
          <div className="mb-3 rounded-lg bg-base-850 border border-base-700 px-3 py-2.5">
            <p className="text-sm font-medium truncate">{user?.nome}</p>
            <p className="text-xs text-ink-500 truncate">CPF {user?.cpfMasked}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-ink-500 hover:text-ink-100 hover:bg-base-800 transition-colors"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        {/* topo desktop: só o sino */}
        <div className="hidden md:flex justify-end px-8 pt-5 -mb-4 max-w-5xl mx-auto">
          <SinoNotificacoes />
        </div>

        {/* topbar mobile */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-base-700 bg-base-900 relative">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-brand-400 to-brand-700" />
            <p className="font-display font-semibold text-sm">PayFlow</p>
          </div>
          <div className="flex items-center gap-1">
            <SinoNotificacoes />
            <button
              type="button"
              onClick={() => setMenuAberto((a) => !a)}
              className="h-9 w-9 rounded-full flex items-center justify-center text-ink-300"
              aria-label="Mais opções"
              aria-expanded={menuAberto}
            >
              {menuAberto ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
          {menuAberto && (
            <div className="absolute right-4 top-full mt-2 w-56 rounded-xl border border-base-700 bg-base-900 shadow-card z-40 py-2">
              {nav
                .filter((n) => !n.principal)
                .map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMenuAberto(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2.5 text-sm ${isActive ? "text-brand-300" : "text-ink-300"}`
                    }
                  >
                    <Icon size={16} /> {label}
                  </NavLink>
                ))}
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-ink-500">
                <LogOut size={16} /> Sair
              </button>
            </div>
          )}
        </div>

        <main className="p-5 md:p-8 pb-24 md:pb-8 max-w-5xl mx-auto">{children}</main>

        {/* bottom nav mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-base-900 border-t border-base-700 flex justify-around py-2">
          {nav
            .filter((n) => n.principal)
            .map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 px-2 py-1 text-[11px] ${
                    isActive ? "text-brand-300" : "text-ink-500"
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
        </nav>
      </div>

      <AvisosNotificacao />
    </div>
  );
}
