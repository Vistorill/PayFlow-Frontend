import { Headphones, QrCode, Receipt, Smartphone, Wallet } from "lucide-react";
import { PRODUTOS } from "../../data/landingContent";
import SectionHeading from "./SectionHeading";

const ICONS = [Wallet, QrCode, Receipt, Smartphone, Headphones];

export default function Produtos() {
  return (
    <section id="produtos" className="scroll-mt-24 max-w-6xl mx-auto px-6 py-20">
      <SectionHeading
        eyebrow={PRODUTOS.eyebrow}
        title={PRODUTOS.title}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {PRODUTOS.items.map((item, i) => {
          const Icon = ICONS[i] ?? Wallet;
          return (
            <div
              key={item.title}
              className="rounded-2xl border border-base-700 bg-base-900 p-6"
            >
              <div className="h-10 w-10 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center mb-4">
                <Icon size={19} />
              </div>
              <h3 className="font-display font-semibold mb-1.5">{item.title}</h3>
              <p className="text-sm text-ink-500">{item.text}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
