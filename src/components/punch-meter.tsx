// Student score as a punch-hole meter — filled circles out of five, NOT a
// progress bar (BRIEF.md). Score is stored 0..100; shown as /5.

type PunchMeterProps = {
  /** 0..100 student score. */
  score: number;
  className?: string;
};

export function PunchMeter({ score, className = "" }: PunchMeterProps) {
  const filled = Math.max(0, Math.min(5, Math.round(score / 20)));

  return (
    <span
      className={`inline-flex items-center gap-[3px] ${className}`}
      role="img"
      aria-label={`Student score ${Math.round(score)} of 100`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`h-2.5 w-2.5 rounded-full border ${
            i < filled ? "border-mtc bg-mtc" : "border-faded/50 bg-transparent"
          }`}
        />
      ))}
    </span>
  );
}
