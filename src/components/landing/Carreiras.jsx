import { ArrowRight, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { CARREIRAS } from "../../data/landingContent";
import SectionHeading from "./SectionHeading";

export default function Carreiras() {
  return (
    <section id="carreiras" className="scroll-mt-24 max-w-6xl mx-auto px-6 py-20">
      <div className="rounded-2xl border border-brand-600/30 bg-gradient-to-br from-brand-700/30 to-base-900 px-8 py-14 text-center">
        <div className="h-10 w-10 rounded-lg bg-brand-500/10 text-brand-300 flex items-center justify-center mx-auto mb-5">
          <Briefcase size={19} />
        </div>
        <SectionHeading
          eyebrow={CARREIRAS.eyebrow}
          title={CARREIRAS.title}
          description={CARREIRAS.description}
          align="center"
          className="mb-8"
        />
        <Link
          to="/login"
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 transition-colors px-6 py-3 rounded-lg font-medium"
        >
          {CARREIRAS.cta} <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
