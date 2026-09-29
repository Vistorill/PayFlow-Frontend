import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  CreditCard,
  Receipt,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const nav = [
  { to: "/app", label: "Visão geral", icon: LayoutDashboard, end: true },
  { to: "/app/pix", label: "Pix", icon: ArrowLeftRight },
  { to: "/app/cartao", label: "Cartão", icon: CreditCard },
  { to: "/app/extrato", label: "Extrato", icon: Receipt },
];

export default function DashboardShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
            {nav.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
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
        {/* topbar mobile */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-base-700 bg-base-900">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-brand-400 to-brand-700" />
            <p className="font-display font-semibold text-sm">PayFlow</p>
          </div>
          <button onClick={handleLogout} className="text-ink-500 text-sm">
            Sair
          </button>
        </div>

        <main className="p-5 md:p-8 max-w-5xl mx-auto">{children}</main>

        {/* bottom nav mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-base-900 border-t border-base-700 flex justify-around py-2">
          {nav.map(({ to, label, icon: Icon, end }) => (
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
    </div>
  );
}
