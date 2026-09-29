import { Check, Landmark } from "lucide-react";
import { INSTITUCIONAL } from "../../data/landingContent";
import SectionHeading from "./SectionHeading";

export default function Institucional() {
  return (
    <section
      id="institucional"
      className="scroll-mt-24 border-y border-base-800 bg-base-900/40"
    >
      <div className="max-w-6xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-start">
        <div>
          <div className="h-10 w-10 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center mb-5">
            <Landmark size={19} />
          </div>
          <SectionHeading
            eyebrow={INSTITUCIONAL.eyebrow}
            title={INSTITUCIONAL.title}
            className="mb-6"
          />
          <p className="text-ink-500 max-w-md">{INSTITUCIONAL.description}</p>
        </div>

        <ul className="space-y-4 lg:pt-16">
          {INSTITUCIONAL.highlights.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 rounded-xl border border-base-700 bg-base-900 px-5 py-4"
            >
              <Check size={16} className="text-mint-400 shrink-0 mt-0.5" />
              <span className="text-sm text-ink-300">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
