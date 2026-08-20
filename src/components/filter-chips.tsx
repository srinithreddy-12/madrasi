import type { ModuleDef } from "@/lib/modules";

// Horizontal scroll row of pills. Active = module-colour fill with a subtle
// lift; inactive = white with a hairline border. The active weight also bumps
// so state doesn't rest on colour alone (HIG: Accessibility > convey with more
// than colour). Negative margins let the row bleed to the screen edges while
// the first and last chips stay clear of them.
export type Chip = { key: string; label: string };

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
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {chips.map((c) => {
        const active = c.key === value;
        return (
          <button
            key={c.key}
            type="button"
            onClick={() => onChange(c.key)}
            aria-pressed={active}
            className={`t-chip pressable h-9 shrink-0 whitespace-nowrap rounded-full border px-4 ${
              active
                ? `${module.bgClass} ${module.onColorClass} border-transparent font-semibold shadow-card`
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
