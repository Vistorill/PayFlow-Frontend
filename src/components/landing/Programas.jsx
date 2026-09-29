import { Flower2, GraduationCap, ArrowRight } from "lucide-react";
import { PROGRAMAS } from "../../data/landingContent";
import SectionHeading from "./SectionHeading";

const ICONS = { "Flor de Cactvs": Flower2, "Cactvs Educa": GraduationCap };

export default function Programas() {
  return (
    <section
      id="impacto"
      className="scroll-mt-24 border-y border-base-800 bg-base-900/40"
    >
      <div className="max-w-6xl mx-auto px-6 py-20">
        <SectionHeading
          eyebrow={PROGRAMAS.eyebrow}
          title={PROGRAMAS.title}
          align="center"
        />

        <div className="grid md:grid-cols-2 gap-5">
          {PROGRAMAS.items.map((item) => {
            const Icon = ICONS[item.title] ?? GraduationCap;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-base-700 bg-base-900 p-7 flex flex-col"
              >
                <div className="h-10 w-10 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center mb-5">
                  <Icon size={19} />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-ink-500 mb-6">{item.text}</p>
                <a
                  href="#contato"
                  className="mt-auto inline-flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300"
                >
                  {PROGRAMAS.cta} <ArrowRight size={15} />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
