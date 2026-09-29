import { BadgeCheck } from "lucide-react";
import { SELOS } from "../../data/landingContent";

export default function Selos() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SELOS.map((selo) => (
          <div
            key={selo.title}
            className="rounded-xl border border-base-800 bg-base-900/50 p-5"
          >
            <BadgeCheck size={18} className="text-brand-400 mb-3" />
            <p className="text-sm font-medium mb-1">{selo.title}</p>
            <p className="text-xs text-ink-500 leading-relaxed">{selo.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
