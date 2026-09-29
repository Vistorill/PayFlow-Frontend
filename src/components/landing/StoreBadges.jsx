import { Apple, Play } from "lucide-react";

const STORES = [
  { label: "App Store", Icon: Apple },
  { label: "Google Play", Icon: Play },
];

export default function StoreBadges({ href = "#app", className = "" }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {STORES.map(({ label, Icon }) => (
        <a
          key={label}
          href={href}
          className="flex items-center gap-2.5 rounded-xl border border-base-700 bg-base-900 hover:border-brand-500 transition-colors px-4 py-2.5"
        >
          <Icon size={20} className="text-ink-100" />
          <span className="text-sm font-medium">{label}</span>
        </a>
      ))}
    </div>
  );
}
