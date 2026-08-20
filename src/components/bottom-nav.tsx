"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MODULES } from "@/lib/modules";

// STYLE-v2 §4: white, 64px, --line top border, block radius on the top corners.
// Icon above word. Active: glyph in a 36px module-colour circle + --ink label.
// Inactive: --muted. 44×44 minimum touch target (the whole cell).
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Modules"
      className="sticky bottom-0 z-30 rounded-t-[28px] border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-[440px] items-stretch">
        {MODULES.map((m) => {
          const active = pathname === m.path || pathname.startsWith(`${m.path}/`);
          const Icon = m.icon;
          return (
            <li key={m.key} className="flex-1">
              <Link
                href={m.path}
                aria-current={active ? "page" : undefined}
                className="flex min-h-16 flex-col items-center justify-center gap-1 px-1"
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${
                    active ? m.bgClass : ""
                  }`}
                >
                  <Icon size={20} strokeWidth={2} className={active ? m.onColorClass : "text-muted"} />
                </span>
                <span className={`t-micro ${active ? "text-ink" : "text-muted"}`}>{m.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
