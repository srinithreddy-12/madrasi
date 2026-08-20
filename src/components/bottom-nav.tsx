"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";
import { MODULE_BY_KEY } from "@/lib/modules";

// Nav modules, in order — Eat lives inside Services now (its old slot is
// Home, the app's actual index route, which needed a way back to it).
const NAV_MODULE_KEYS = ["speak", "move", "live", "explore"] as const;

// STYLE-v2 §4: white, 64px, --line top border, block radius on the top corners.
// Icon above word. Active: glyph in a 36px module-colour circle + --ink label.
// Inactive: --muted. 44×44 minimum touch target (the whole cell).
export function BottomNav() {
  const pathname = usePathname();
  const homeActive = pathname === "/";

  return (
    <nav
      aria-label="Sections"
      className="sticky bottom-0 z-30 rounded-t-[28px] border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-[440px] items-stretch">
        <li className="flex-1">
          <Link
            href="/"
            aria-current={homeActive ? "page" : undefined}
            className="flex min-h-16 flex-col items-center justify-center gap-1 px-1"
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full ${
                homeActive ? "bg-ink" : ""
              }`}
            >
              <Home size={20} strokeWidth={2} className={homeActive ? "text-white" : "text-muted"} />
            </span>
            <span className={`t-micro ${homeActive ? "text-ink" : "text-muted"}`}>Home</span>
          </Link>
        </li>
        {NAV_MODULE_KEYS.map((key) => {
          const m = MODULE_BY_KEY[key];
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
