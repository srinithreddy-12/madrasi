import Link from "next/link";
import type { ModuleDef } from "@/lib/modules";

// STYLE-v2 §4: a block-radius card filled with the module colour. Icon top-left
// in a 40px circle at 20% white (or 20% ink on ochre), route code top-right,
// name in title, one body line at 80%, progress count bottom-right. No shadow.
export function ModuleBlock({
  module,
  blurb,
  progress,
}: {
  module: ModuleDef;
  blurb: string;
  progress?: string;
}) {
  const Icon = module.icon;
  const onInk = module.onColorClass === "text-ink";

  return (
    <Link
      href={module.path}
      className={`block rounded-block p-5 ${module.bgClass} ${module.onColorClass} [transition:transform_120ms_ease-out] active:scale-[0.98]`}
    >
      <div className="flex items-start justify-between">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-full ${
            onInk ? "bg-ink/20" : "bg-white/20"
          }`}
        >
          <Icon size={22} strokeWidth={2} />
        </span>
        <span className="t-micro opacity-70">{module.routeCode}</span>
      </div>
      <p className="t-title mt-4">{module.label}</p>
      <div className="mt-1 flex items-end justify-between gap-3">
        <p className="t-body max-w-[72%] opacity-80">{blurb}</p>
        {progress && <span className="t-label shrink-0 opacity-90">{progress}</span>}
      </div>
    </Link>
  );
}
