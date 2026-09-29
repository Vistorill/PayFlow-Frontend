import { ArrowRight, Landmark, Store, Wheat } from "lucide-react";
import { Link } from "react-router-dom";
import { MICROCREDITO } from "../../data/landingContent";
import SectionHeading from "./SectionHeading";

const ICONS = { "Microcrédito Rural": Wheat, "Microcrédito Urbano": Store };

export default function Microcredito() {
  return (
    <section id="microcredito" className="scroll-mt-24 max-w-6xl mx-auto px-6 py-20">
      <SectionHeading
        eyebrow={MICROCREDITO.eyebrow}
        title={MICROCREDITO.title}
        description="Acesso a microcrédito operado por instituições parceiras, com condições que respeitam a realidade de cada negócio."
      />

      <div className="grid md:grid-cols-2 gap-5">
        {MICROCREDITO.items.map((item) => {
          const Icon = ICONS[item.title] ?? Landmark;
          return (
            <div
              key={item.title}
              className="rounded-2xl border border-base-700 bg-base-900 p-7 flex flex-col"
            >
              <div className="h-10 w-10 rounded-lg bg-mint-400/10 text-mint-400 flex items-center justify-center mb-5">
                <Icon size={19} />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-ink-500 mb-6">{item.text}</p>
              <Link
                to="/login"
                className="mt-auto inline-flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300"
              >
                Solicitar <ArrowRight size={15} />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
