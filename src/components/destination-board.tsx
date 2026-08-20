type DestinationBoardProps = {
  /** Board rows — amber dot-matrix on ink. Aim for 5+. */
  lines: string | string[];
  /** Small etched label on the windscreen frame. */
  marquee?: string;
  className?: string;
};

/**
 * The LED destination board (STYLE-v1.1 §5): full bleed, no outer rounding,
 * rows 44px tall, amber 19px DM Mono at 0.12em, with a 2px scanline texture so
 * the ink panel reads as emitting light. Static here; the character-cycle flip
 * (Home's signature moment) is a separate client component.
 */
export function DestinationBoard({ lines, marquee, className = "" }: DestinationBoardProps) {
  const rows = Array.isArray(lines) ? lines : [lines];

  return (
    <div className={`relative bg-ink ${className}`}>
      {marquee && (
        <div className="label flex items-center justify-between px-4 py-1 text-micro text-manila/50">
          <span>{marquee}</span>
          <span aria-hidden="true">● ● ●</span>
        </div>
      )}

      <div className="flex flex-col">
        {rows.map((row, i) => (
          <p
            key={i}
            className="tabular flex min-h-[44px] items-center truncate px-4 text-heading tracking-[0.12em] text-amber [text-shadow:0_0_10px_rgba(255,165,31,0.4)]"
          >
            {row}
          </p>
        ))}
      </div>

      {/* Scanlines — 2px repeating gradient at ~6%, over the whole panel. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.06) 0 1px, transparent 1px 2px)",
        }}
      />
    </div>
  );
}
