import type { ReactNode } from "react";
import { User } from "lucide-react";

// STYLE-v2 §4: avatar circle · "Hey, Name!" (name bolder) · pill button right.
// 48px tall, no gradient banner.
export function GreetingRow({ name, right }: { name: string; right?: ReactNode }) {
  return (
    <div className="flex h-12 items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-speak text-white">
          <User size={20} strokeWidth={2} />
        </span>
        <p className="t-subtitle text-ink">
          Hey, <span className="font-bold">{name}</span>!
        </p>
      </div>
      {right}
    </div>
  );
}
