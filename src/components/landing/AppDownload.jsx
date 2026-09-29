import { Smartphone } from "lucide-react";
import { APP_DOWNLOAD } from "../../data/landingContent";
import StoreBadges from "./StoreBadges";

export default function AppDownload() {
  return (
    <section
      id="app"
      className="scroll-mt-24 border-y border-base-800 bg-base-900/40"
    >
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="h-10 w-10 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto mb-5">
          <Smartphone size={19} />
        </div>
        <h2 className="font-display text-3xl md:text-4xl font-semibold mb-3">
          {APP_DOWNLOAD.title}
        </h2>
        <p className="text-ink-500 mb-8">{APP_DOWNLOAD.description}</p>
        <StoreBadges href="#app" className="justify-center" />
      </div>
    </section>
  );
}
