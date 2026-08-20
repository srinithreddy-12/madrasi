import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ModuleDef } from "@/lib/modules";

// Home's module row (CLARITY §"five module rows"): keeps the module colour as a
// circle on a soft tint, with the module name and one plain line saying what the
// section is for. No progress number — the scoreboard lives on the You screen.
export function ModuleTile({
  module,
  subtitle,
}: {
  module: ModuleDef;
  subtitle: string;
}) {
  const Icon = module.icon;

  return (
    <Link
      href={module.path}
      className={`pressable flex items-center gap-3 rounded-card p-3 ${module.tintClass}`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${module.bgClass} ${module.onColorClass}`}
      >
        <Icon size={20} strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="t-subtitle text-ink">{module.label}</p>
        <p className="t-caption text-muted">{subtitle}</p>
      </div>
      <ChevronRight size={18} strokeWidth={2.25} className="shrink-0 text-muted" />
    </Link>
  );
}
