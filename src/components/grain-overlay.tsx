// Ambient grain: one static noise overlay at ~4% opacity, fixed over the whole
// app. Not animated. This is what stops the manila reading as flat beige
// (BRIEF.md motion section). Decorative and non-interactive.

// Inline SVG fractal noise, URL-encoded so it's fully self-contained (no asset
// request, works offline for the PWA).
const NOISE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

export function GrainOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 opacity-[0.04] mix-blend-multiply"
      style={{ backgroundImage: `url("${NOISE}")`, backgroundRepeat: "repeat" }}
    />
  );
}
