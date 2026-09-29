import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { NAV_LINKS } from "../../data/landingContent";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-base-800 bg-base-950/85 backdrop-blur">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-700" />
          <div className="leading-tight">
            <p className="font-display font-semibold">Cactvs</p>
            <p className="text-[11px] text-ink-500">Instituição de Pagamento</p>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-7 text-sm text-ink-500">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-ink-100 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="hidden sm:block text-sm bg-base-900 border border-base-700 hover:border-brand-500 transition-colors px-4 py-2 rounded-lg font-medium"
          >
            Acesse sua conta
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            className="lg:hidden h-9 w-9 flex items-center justify-center rounded-lg border border-base-700 text-ink-300"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="lg:hidden border-t border-base-800 bg-base-950 px-6 py-4 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="py-2 text-sm text-ink-300 hover:text-ink-100"
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className="mt-2 sm:hidden text-center text-sm bg-brand-500 hover:bg-brand-600 transition-colors px-4 py-2.5 rounded-lg font-medium"
          >
            Acesse sua conta
          </Link>
        </nav>
      )}
    </header>
  );
}
