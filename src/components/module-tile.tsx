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
      className={`flex flex-col gap-3 rounded-card p-4 ${module.bgClass} ${module.onColorClass} [transition:transform_120ms_ease-out] active:scale-[0.97]`}
    >
      <div className="flex items-center justify-between">
        <span className={`flex h-8 w-8 items-center justify-center rounded-full ${onInk ? "bg-ink/20" : "bg-white/20"}`}>
          <Icon size={17} strokeWidth={2} />
        </span>
        {progress && <span className="t-micro opacity-70">{progress}</span>}
      </div>
      <p className="t-subtitle">{module.label}</p>
    </Link>
  );
}
