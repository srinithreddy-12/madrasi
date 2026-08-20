import type { LucideIcon } from "lucide-react";
import { Utensils, Languages, Bus, WashingMachine, Compass } from "lucide-react";

// The five MADRASI modules. STYLE-v2: one colour per module — a user should
// know which module they're in from the colour alone. Route numbers stay as
// content. Class strings are literal so Tailwind's scanner keeps them.
//
// v2 (cities) will source route code + local word per city; keep reads here.

export type ModuleKey = "eat" | "speak" | "move" | "live" | "explore";

export type ModuleDef = {
  key: ModuleKey;
  label: string;
  routeCode: string;
  path: string;
  icon: LucideIcon;
  /** Raw colour value for SVG strokes / inline styles. */
  cssVar: string;
  /** bg-<module> — the solid colour fill. */
  bgClass: string;
  /** bg-<module>-tint — 12% soft background. */
  tintClass: string;
  /** text-<module> — the colour as text/icon. */
  textClass: string;
  /** border-<module>. */
  borderClass: string;
  /** Text colour to use ON the solid colour (ochre needs ink; rest need white). */
  onColorClass: string;
};

export const MODULES: ModuleDef[] = [
  {
    key: "eat",
    label: "Eat",
    routeCode: "21G",
    path: "/live?tab=eat",
    icon: Utensils,
    cssVar: "var(--eat)",
    bgClass: "bg-eat",
    tintClass: "bg-eat-tint",
    textClass: "text-eat",
    borderClass: "border-eat",
    onColorClass: "text-ink", // white on ochre fails contrast
  },
  {
    key: "speak",
    label: "Speak",
    routeCode: "5C",
    path: "/speak",
    icon: Languages,
    cssVar: "var(--speak)",
    bgClass: "bg-speak",
    tintClass: "bg-speak-tint",
    textClass: "text-speak",
    borderClass: "border-speak",
    onColorClass: "text-white",
  },
  {
    key: "move",
    label: "Move",
    routeCode: "23C",
    path: "/move",
    icon: Bus,
    cssVar: "var(--move)",
    bgClass: "bg-move",
    tintClass: "bg-move-tint",
    textClass: "text-move",
    borderClass: "border-move",
    onColorClass: "text-white",
  },
  {
    key: "live",
    label: "Services",
    routeCode: "29C",
    path: "/live",
    icon: WashingMachine,
    cssVar: "var(--live)",
    bgClass: "bg-live",
    tintClass: "bg-live-tint",
    textClass: "text-live",
    borderClass: "border-live",
    onColorClass: "text-white",
  },
  {
    key: "explore",
    label: "Explore",
    routeCode: "1B",
    path: "/explore",
    icon: Compass,
    cssVar: "var(--explore)",
    bgClass: "bg-explore",
    tintClass: "bg-explore-tint",
    textClass: "text-explore",
    borderClass: "border-explore",
    onColorClass: "text-white",
  },
];

export const MODULE_BY_KEY: Record<ModuleKey, ModuleDef> = Object.fromEntries(
  MODULES.map((m) => [m.key, m]),
) as Record<ModuleKey, ModuleDef>;
