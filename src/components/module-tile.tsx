import Link from "next/link";
import type { ModuleDef } from "@/lib/modules";

// Compact 2-column grid tile — replaces the old full-width ModuleBlock so
// Home's four module links read as one tidy square instead of four tall
// stacked cards. Icon + progress on one line, label below; no blurb.
export function ModuleTile({ module, progress }: { module: ModuleDef; progress?: string }) {
  const Icon = module.icon;
  const onInk = module.onColorClass === "text-ink";

  return (
    <Link
      href={module.path}
      className={`pressable flex flex-col gap-3 rounded-card p-4 ${module.bgClass} ${module.onColorClass}`}
    >
      <div className="flex items-center justify-between">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${onInk ? "bg-ink/15" : "bg-white/20"}`}>
          <Icon size={18} strokeWidth={2} />
        </span>
        {progress && <span className="t-chip rounded-full px-2 py-0.5 opacity-80">{progress}</span>}
      </div>
      <p className="t-subtitle">{module.label}</p>
    </Link>
  );
}
