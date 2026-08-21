import Link from "next/link";
import type { ModuleDef } from "@/lib/modules";

// Home's module card (2×2 grid): a short photo-style card in the content-card
// treatment — the module colour as an icon block on top, the module name below,
// and an optional one-line subtitle. No progress number — the scoreboard lives
// on the You screen.
export function ModuleTile({
  module,
  subtitle,
}: {
  module: ModuleDef;
  subtitle?: string;
}) {
  const Icon = module.icon;

  return (
    <Link
      href={module.path}
      className="pressable flex flex-col gap-2 rounded-card border border-line bg-surface p-3 shadow-card"
    >
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-full ${module.bgClass} ${module.onColorClass}`}
      >
        <Icon size={20} strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <p className="t-subtitle text-ink">{module.label}</p>
        {subtitle && <p className="t-caption truncate text-muted">{subtitle}</p>}
      </div>
    </Link>
  );
}
