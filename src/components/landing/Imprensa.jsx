import { Mail } from "lucide-react";
import { IMPRENSA } from "../../data/landingContent";
import SectionHeading from "./SectionHeading";

export default function Imprensa() {
  return (
    <section id="imprensa" className="scroll-mt-24 max-w-6xl mx-auto px-6 py-20">
      <div className="rounded-2xl border border-base-700 bg-base-900 p-8 md:p-10 grid md:grid-cols-2 gap-8 items-center">
        <SectionHeading
          eyebrow={IMPRENSA.eyebrow}
          title={IMPRENSA.title}
          description={IMPRENSA.description}
          className="mb-0"
        />
        <div className="md:justify-self-end">
          <a
            href="#contato"
            className="inline-flex items-center gap-2 border border-base-700 hover:border-brand-500 transition-colors px-5 py-3 rounded-lg font-medium"
          >
            <Mail size={16} /> {IMPRENSA.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
