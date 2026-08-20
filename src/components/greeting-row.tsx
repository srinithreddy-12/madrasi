import type { ReactNode } from "react";
import { User } from "lucide-react";

// Home's large-title header: avatar + a quiet eyebrow over the greeting, with
// one trailing action. Clears the top safe area so it reads as the screen title
// (HIG: keep primary elements toward the top; use size/weight for hierarchy).
export function GreetingRow({ name, avatar, right }: { name: string; avatar?: string; right?: ReactNode }) {
  return (
    <header className="flex items-center justify-between gap-3 pt-[calc(env(safe-area-inset-top)+8px)]">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-speak text-white shadow-card">
          {avatar ? <span className="text-base leading-none">{avatar}</span> : <User size={18} strokeWidth={2} />}
        </span>
        <div className="min-w-0">
          <p className="t-micro text-muted">Welcome back</p>
          <p className="t-hero truncate text-ink">
            Hey, <span className="font-extrabold">{name}</span>
          </p>
        </div>
      </div>
      {right}
    </header>
  );
}
