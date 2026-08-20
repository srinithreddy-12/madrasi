"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MODULES } from "@/lib/modules";

/**
 * The five word-labelled module tabs (STYLE-v1.1 §5): ink background, 64px tall,
 * no radius. Route code above the word, both DM Mono. Active tab gets a 3px
 * amber top border and amber text; inactive labels are lightened manila for ink.
 * The whole tab is a ≥44×44 touch target regardless of the visible label size.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Modules"
      className="sticky bottom-0 z-30 bg-ink pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-[420px] items-stretch">
        {MODULES.map((m) => {
          const active = pathname === m.path || pathname.startsWith(`${m.path}/`);
          return (
            <li key={m.key} className="flex-1">
              <Link
                href={m.path}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-0.5 border-t-[3px] px-1 ${
                  active ? "border-amber" : "border-transparent"
                }`}
              >
                <span
                  className={`tabular text-micro leading-none ${
                    active ? "text-amber" : "text-manila/55"
                  }`}
                >
                  {m.routeCode}
                </span>
                <span
                  className={`label text-micro leading-none ${
                    active ? "text-amber" : "text-manila/55"
                  }`}
                >
                  {m.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
