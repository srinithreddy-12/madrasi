"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User } from "lucide-react";
import { MODULE_BY_KEY } from "@/lib/modules";

// Nav sections, in order — Eat lives inside Services now (its old slot is
// Home, the app's actual index route, which needed a way back to it).
const NAV_MODULE_KEYS = ["speak", "move", "live", "explore"] as const;

// Apple-style translucent tab bar: content scrolls beneath a frosted material
// (HIG: controls float above content). Home + four sections, icon above word.
// Active item lifts its glyph into a filled capsule; the label darkens to --ink
// and bolds so state isn't colour-only. Each cell is a 44×44+ touch target.
export function BottomNav() {
  const pathname = usePathname();
  const homeActive = pathname === "/";
  const profileActive = pathname === "/profile" || pathname.startsWith("/profile/");

  return (
    <nav
      aria-label="Sections"
      className="material-bar sticky bottom-0 z-30 rounded-t-[28px] pb-[env(safe-area-inset-bottom)]"
      style={{ borderTop: "1px solid var(--material-hairline)" }}
    >
      <ul className="mx-auto flex max-w-[440px] items-stretch px-1 pt-1.5">
        <li className="flex-1">
          <Link
            href="/"
            aria-current={homeActive ? "page" : undefined}
            className="flex min-h-[60px] flex-col items-center justify-center gap-1 px-1"
          >
            <span
              className={`pressable flex h-9 w-9 items-center justify-center rounded-full ${
                homeActive ? "bg-ink shadow-card" : ""
              }`}
            >
              <Home
                size={20}
                strokeWidth={homeActive ? 2.4 : 2}
                className={homeActive ? "text-white" : "text-muted"}
              />
            </span>
            <span className={`t-micro ${homeActive ? "font-semibold text-ink" : "text-muted"}`}>
              Home
            </span>
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
                className="flex min-h-[60px] flex-col items-center justify-center gap-1 px-1"
              >
                <span
                  className={`pressable flex h-9 w-9 items-center justify-center rounded-full ${
                    active ? `${m.bgClass} shadow-card` : ""
                  }`}
                >
                  <Icon
                    size={20}
                    strokeWidth={active ? 2.4 : 2}
                    className={active ? m.onColorClass : "text-muted"}
                  />
                </span>
                <span className={`t-micro ${active ? "font-semibold text-ink" : "text-muted"}`}>
                  {m.label}
                </span>
              </Link>
            </li>
          );
        })}
        <li className="flex-1">
          <Link
            href="/profile"
            aria-current={profileActive ? "page" : undefined}
            className="flex min-h-[60px] flex-col items-center justify-center gap-1 px-1"
          >
            <span
              className={`pressable flex h-9 w-9 items-center justify-center rounded-full ${
                profileActive ? "bg-ink shadow-card" : ""
              }`}
            >
              <User
                size={20}
                strokeWidth={profileActive ? 2.4 : 2}
                className={profileActive ? "text-white" : "text-muted"}
              />
            </span>
            <span className={`t-micro ${profileActive ? "font-semibold text-ink" : "text-muted"}`}>
              Profile
            </span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
