import type { ReactNode } from "react";

// Section header (STYLE-v1.1 §5): a full-width 32px ink bar with an amber mono
// label — NOT small grey text. Sticky just under the status strip while its
// section is in view, so the alternating bands read as one system.
export function SectionBar({ children }: { children: ReactNode }) {
  return (
    <div className="sticky top-8 z-20 flex h-8 items-center bg-ink px-4">
      <h2 className="label text-label text-amber">{children}</h2>
    </div>
  );
}
