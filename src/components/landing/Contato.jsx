import { ArrowRight, Handshake, Mail, Phone } from "lucide-react";
import { CONTATO } from "../../data/landingContent";
import SectionHeading from "./SectionHeading";

export default function Contato() {
  return (
    <section
      id="contato"
      className="scroll-mt-24 border-y border-base-800 bg-base-900/40"
    >
      <div className="max-w-6xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="h-10 w-10 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center mb-5">
            <Handshake size={19} />
          </div>
          <SectionHeading
            eyebrow={CONTATO.eyebrow}
            title={CONTATO.title}
            description={CONTATO.description}
            className="mb-0"
          />
        </div>

        <div className="rounded-2xl border border-base-700 bg-base-900 p-7">
          <a
            href={`mailto:${CONTATO.email}`}
            className="flex items-center gap-3 mb-5"
          >
            <div className="h-9 w-9 shrink-0 rounded-lg bg-base-850 border border-base-700 flex items-center justify-center text-brand-400">
              <Mail size={16} />
            </div>
            <div>
              <p className="text-xs text-ink-500">E-mail</p>
              <p className="text-sm text-ink-100">{CONTATO.email}</p>
            </div>
          </a>
          <a href="#contato" className="flex items-center gap-3 mb-7">
            <div className="h-9 w-9 shrink-0 rounded-lg bg-base-850 border border-base-700 flex items-center justify-center text-brand-400">
              <Phone size={16} />
            </div>
            <div>
              <p className="text-xs text-ink-500">Atendimento</p>
              <p className="text-sm text-ink-100">Atendimento humanizado e ágil</p>
            </div>
          </a>
          <a
            href={`mailto:${CONTATO.email}`}
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 transition-colors px-5 py-3 rounded-lg font-medium"
          >
            {CONTATO.cta} <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
