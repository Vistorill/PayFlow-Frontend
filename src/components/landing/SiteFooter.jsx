import { Link } from "react-router-dom";
import { Mail, MapPin } from "lucide-react";
import { CONTATOS, FOOTER_LINKS, NAV_LINKS } from "../../data/landingContent";

export default function SiteFooter() {
  return (
    <footer className="border-t border-base-800 bg-base-900/40">
      <div className="max-w-6xl mx-auto px-6 py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-700" />
            <div className="leading-tight">
              <p className="font-display font-semibold">Cactvs</p>
              <p className="text-[11px] text-ink-500">Instituição de Pagamento</p>
            </div>
          </div>
          <p className="text-sm text-ink-500 max-w-sm">
            Estruturamos a jornada financeira de quem empreende na nossa região,
            com acesso a microcrédito e conta digital.
          </p>
          <p className="mt-5 flex items-center gap-2 text-sm text-ink-500">
            <MapPin size={15} className="text-brand-400 shrink-0" />
            Atendimento em toda a nossa região
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-700 mb-4">
            Navegação
          </p>
          <ul className="space-y-2.5 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="text-ink-500 hover:text-ink-100">
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <Link to="/login" className="text-ink-500 hover:text-ink-100">
                Acesse sua conta
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-700 mb-4">
            Institucional
          </p>
          <ul className="space-y-2.5 text-sm">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="text-ink-500 hover:text-ink-100">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-base-800">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-3 text-xs text-ink-700">
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            {CONTATOS.map((c) => (
              <a
                key={c.label}
                href={`mailto:${c.value}`}
                className="flex items-center gap-1.5 hover:text-ink-300"
              >
                <Mail size={12} />
                {c.label}
              </a>
            ))}
          </div>
          <p>© 2026 Cactvs Instituição de Pagamento. Protótipo de demonstração.</p>
        </div>
      </div>
    </footer>
  );
}
