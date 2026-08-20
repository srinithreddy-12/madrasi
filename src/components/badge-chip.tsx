import { Check, Lock } from "lucide-react";

// STYLE-v2 §4: chip-radius, 32px. Unlocked = module-colour fill; locked =
// --line fill, --muted text, lock icon.
export function BadgeChip({
  label,
  unlocked,
  fillClass,
  onColorClass,
}: {
  label: string;
  unlocked: boolean;
  /** bg-<module> for the unlocked fill. */
  fillClass: string;
  /** text colour on that fill. */
  onColorClass: string;
}) {
  return (
    <span
      className={`t-chip inline-flex h-8 items-center gap-1.5 rounded-full px-3 ${
        unlocked ? `${fillClass} ${onColorClass}` : "bg-line text-muted"
      }`}
    >
      {unlocked ? <Check size={13} strokeWidth={2.5} /> : <Lock size={12} strokeWidth={2.5} />}
      {label}
    </span>
  );
}
