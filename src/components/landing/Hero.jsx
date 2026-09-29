import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { HERO } from "../../data/landingContent";
import StoreBadges from "./StoreBadges";

const APP_PREVIEW = [
  { label: "Microcrédito liberado", value: "+ R$ 2.000,00", positive: true },
  { label: "Pix recebido — Ateliê da Ana", value: "+ R$ 480,00", positive: true },
  { label: "Boleto pago — Fornecedor", value: "− R$ 640,00" },
];

export default function Hero() {
  return (
    <section id="inicio" className="scroll-mt-24 max-w-6xl mx-auto px-6 pt-14 pb-20 grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <p className="text-brand-400 text-xs font-medium uppercase tracking-wide mb-4">
          {HERO.eyebrow}
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-semibold leading-[1.08] mb-6">
          {HERO.title}
        </h1>
        <p className="text-ink-500 text-lg max-w-md mb-8">{HERO.description}</p>

        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3 mb-9">
          {HERO.highlights.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-ink-300">
              <Check size={16} className="text-mint-400 shrink-0 mt-0.5" />
              {item}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-4 mb-8">
          <Link
            to="/login"
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 transition-colors px-5 py-3 rounded-lg font-medium"
          >
            Abra sua conta grátis <ArrowRight size={16} />
          </Link>
          <a href="#microcredito" className="text-sm text-ink-500 hover:text-ink-100">
            Conhecer o microcrédito
          </a>
        </div>

        <StoreBadges />
      </div>

      <div className="relative rounded-[2rem] border border-base-700 bg-base-900 p-6 shadow-glow">
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs text-ink-500">11Saldo disponível</p>
          <p className="text-[11px] text-mint-400">Conta ativa</p>
        </div>
        <p className="font-display text-3xl font-semibold mb-6">R$ 2.897,50</p>
        <div className="space-y-3">
          {APP_PREVIEW.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between rounded-lg bg-base-850 border border-base-700 px-4 py-3"
            >
              <span className="text-sm text-ink-300">{row.label}</span>
              <span
                className={`text-sm font-medium ${
                  row.positive ? "text-mint-400" : "text-ink-100"
                }`}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-5 text-[11px] text-ink-700">
          Imagem ilustrativa do app Cactvs.
        </p>
      </div>
    </section>
  );
}
