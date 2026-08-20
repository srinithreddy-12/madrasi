// The five MADRASI modules, as MTC route numbers (BRIEF.md — the pass metaphor).
//
// v1 (Chennai) registry, kept deliberately static. In v2 the route code and the
// local word become city-scoped (sourced from src/data/cities.ts via useCity()),
// so anything reading these should go through this module, never hardcode "21G".

export type ModuleKey = "eat" | "speak" | "move" | "live" | "explore";

export type ModuleDef = {
  key: ModuleKey;
  /** English word label — the accessible name. Never shown as an icon alone. */
  label: string;
  /** MTC route number shown on the route badge. */
  routeCode: string;
  /** App route this module lives at. */
  path: string;
};

export const MODULES: ModuleDef[] = [
  { key: "eat", label: "EAT", routeCode: "21G", path: "/eat" },
  { key: "speak", label: "SPEAK", routeCode: "5C", path: "/speak" },
  { key: "move", label: "MOVE", routeCode: "23C", path: "/move" },
  { key: "live", label: "LIVE", routeCode: "29C", path: "/live" },
  { key: "explore", label: "EXPLORE", routeCode: "1B", path: "/explore" },
];

export const MODULE_BY_KEY: Record<ModuleKey, ModuleDef> = Object.fromEntries(
  MODULES.map((m) => [m.key, m]),
) as Record<ModuleKey, ModuleDef>;
