import type { ModuleDef } from "@/lib/modules";

export type Chip = { key: string; label: string };

// STYLE-v2 §4: horizontal scroll row. Active = module-colour fill; inactive =
// white fill with a --line border. 34px tall, 14px horizontal padding.
export function FilterChips({
  chips,
  value,
  onChange,
  module,
}: {
  chips: Chip[];
  value: string;
  onChange: (key: string) => void;
  module: ModuleDef;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {chips.map((c) => {
        const active = c.key === value;
        return (
          <button
            key={c.key}
            type="button"
            onClick={() => onChange(c.key)}
            aria-pressed={active}
            className={`t-chip h-[34px] shrink-0 whitespace-nowrap rounded-full border px-3.5 ${
              active
                ? `${module.bgClass} ${module.onColorClass} border-transparent`
                : "border-line bg-surface text-ink"
            }`}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
