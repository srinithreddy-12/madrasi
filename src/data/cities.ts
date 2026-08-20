// src/data/cities.ts
//
// MADRASI v2 — city registry.
// This is the ONLY file that knows cities are different from each other.
// If you are adding a city-specific branch anywhere else, come back here instead.
//
// Fare rates and timings are 2026 street estimates, not published tariffs.
// They exist to make Fare Shield useful on day one and are corrected by user reports.

export type ModuleKey = "eat" | "speak" | "move" | "live" | "explore";
export type LanguageCode = "ta" | "kn" | "hi";

export type LanguagePack = {
  code: LanguageCode;
  name: string;
  script: string;
  /** Anek superfamily member — same baseline and weight axis as Anek Latin. */
  fontFamily: string;
  /** The Fare Shield negotiation line. Spoken aloud via TTS. */
  fareLine: { local: string; roman: string; en: string };
};

export type CityRoute = {
  module: ModuleKey;
  /** Real bus route number from that city's transit authority. */
  code: string;
  /** Local-language word for the module. Secondary label — English stays primary. */
  localWord: string;
};

export type FareRule = {
  /** Flag-down fare in rupees. */
  base: number;
  /** Distance in km covered by the base fare. */
  baseKm: number;
  /** Rupees per km beyond baseKm. */
  perKm: number;
  /** Multiplier applied after nightStartHour. */
  nightMultiplier: number;
  /** 24h clock. */
  nightStartHour: number;
};

export type City = {
  slug: string;
  name: string;
  /** Display string on the pass card only. Never the app title. */
  editionName: string;
  state: string;
  language: LanguageCode;
  transitAuthority: string;
  metroName: string;
  /** Rebinds the --mtc token. All other palette tokens are constant. */
  passColor: string;
  /** Only Delhi sets this — DTC red collides with --stamp. */
  stampOverride?: string;
  fare: FareRule;
  /** One city-specific line surfaced in MOVE. Real, useful, locally known. */
  transitNote: string;
  /** 1 = seeded deep, 2 = sparse, shows the "help us map it" contribute state. */
  tier: 1 | 2;
  active: boolean;
  routes: CityRoute[];
  areas: { name: string; studentHub: boolean }[];
};

// ---------------------------------------------------------------------------
// Language packs — keyed by language, NOT by city.
// Delhi and Gurgaon both point at "hi". Adding Noida costs a city row, not a pack.
// ---------------------------------------------------------------------------

export const languagePacks: Record<LanguageCode, LanguagePack> = {
  ta: {
    code: "ta",
    name: "Tamil",
    script: "Tamil",
    fontFamily: "Anek Tamil",
    fareLine: {
      local: "மீட்டர்ல வாங்க அண்ணா. எவ்ளோ ஆகும்?",
      roman: "Meter-la vaanga anna. Evlo aagum?",
      en: "Come on the meter, brother. How much will it be?",
    },
  },
  kn: {
    code: "kn",
    name: "Kannada",
    script: "Kannada",
    fontFamily: "Anek Kannada",
    fareLine: {
      local: "ಮೀಟರ್ ಹಾಕಿ ಅಣ್ಣಾ. ಎಷ್ಟು ಆಗುತ್ತೆ?",
      roman: "Meter haaki anna. Estu aagutte?",
      en: "Put the meter on, brother. How much will it be?",
    },
  },
  hi: {
    code: "hi",
    name: "Hindi",
    script: "Devanagari",
    fontFamily: "Anek Devanagari",
    fareLine: {
      local: "भैया मीटर से चलो। कितना लगेगा?",
      roman: "Bhaiya meter se chalo. Kitna lagega?",
      en: "Brother, go by the meter. How much will it cost?",
    },
  },
};

// ---------------------------------------------------------------------------
// Cities
// ---------------------------------------------------------------------------

export const cities: City[] = [
  {
    slug: "chennai",
    name: "Chennai",
    editionName: "MADRASI",
    state: "Tamil Nadu",
    language: "ta",
    transitAuthority: "MTC",
    metroName: "Chennai Metro",
    passColor: "#0F4D3A",
    fare: { base: 25, baseKm: 1.8, perKm: 12, nightMultiplier: 1.5, nightStartHour: 23 },
    transitNote:
      "The MTC monthly student pass is the cheapest way to move. Share autos on fixed routes beat metered autos on almost every short trip.",
    tier: 1,
    active: true,
    routes: [
      { module: "eat", code: "21G", localWord: "Sappadu" },
      { module: "speak", code: "5C", localWord: "Pesu" },
      { module: "move", code: "23C", localWord: "Po" },
      { module: "live", code: "29C", localWord: "Iru" },
      { module: "explore", code: "1B", localWord: "Suthu" },
    ],
    areas: [
      { name: "Velachery", studentHub: true },
      { name: "Guindy", studentHub: true },
      { name: "Tambaram", studentHub: true },
      { name: "Kotturpuram", studentHub: true },
      { name: "T. Nagar", studentHub: false },
      { name: "Adyar", studentHub: false },
      { name: "Besant Nagar", studentHub: false },
      { name: "Mylapore", studentHub: false },
      { name: "Anna Nagar", studentHub: false },
      { name: "Egmore", studentHub: false },
    ],
  },

  {
    slug: "bengaluru",
    name: "Bengaluru",
    editionName: "NAMMAKAAR",
    state: "Karnataka",
    language: "kn",
    transitAuthority: "BMTC",
    metroName: "Namma Metro",
    passColor: "#14417A",
    fare: { base: 30, baseKm: 2.0, perKm: 15, nightMultiplier: 1.5, nightStartHour: 22 },
    transitNote:
      "The BMTC daily pass pays for itself in three trips. Autos routinely refuse the meter here — open Fare Shield before you approach one, not after.",
    tier: 1,
    active: true,
    routes: [
      { module: "eat", code: "356", localWord: "Oota" },
      { module: "speak", code: "201", localWord: "Maathu" },
      { module: "move", code: "500D", localWord: "Hogu" },
      { module: "live", code: "314", localWord: "Iru" },
      { module: "explore", code: "401K", localWord: "Suttu" },
    ],
    areas: [
      { name: "Koramangala", studentHub: true },
      { name: "BTM Layout", studentHub: true },
      { name: "Jayanagar", studentHub: true },
      { name: "Malleshwaram", studentHub: true },
      { name: "Yelahanka", studentHub: true },
      { name: "Indiranagar", studentHub: false },
      { name: "HSR Layout", studentHub: false },
      { name: "Marathahalli", studentHub: false },
      { name: "Whitefield", studentHub: false },
      { name: "Electronic City", studentHub: false },
    ],
  },

  {
    slug: "delhi",
    name: "Delhi",
    editionName: "DILLIWALA",
    state: "Delhi NCR",
    language: "hi",
    transitAuthority: "DTC",
    metroName: "Delhi Metro",
    passColor: "#7E241B",
    // DTC red sits too close to --stamp (#C4342A). Punch marks go ink-black here.
    stampOverride: "#16130E",
    fare: { base: 30, baseKm: 1.5, perKm: 11, nightMultiplier: 1.25, nightStartHour: 23 },
    transitNote:
      "DTC buses are free for women across the city. E-rickshaws handle the last kilometre from any metro station for ₹10–20 — always shared, never metered.",
    tier: 1,
    active: true,
    routes: [
      { module: "eat", code: "764", localWord: "Khaana" },
      { module: "speak", code: "522", localWord: "Bolo" },
      { module: "move", code: "340", localWord: "Chalo" },
      { module: "live", code: "429", localWord: "Raho" },
      { module: "explore", code: "620", localWord: "Ghoomo" },
    ],
    areas: [
      { name: "Kamla Nagar", studentHub: true },
      { name: "Hudson Lane / GTB Nagar", studentHub: true },
      { name: "Mukherjee Nagar", studentHub: true },
      { name: "Satya Niketan", studentHub: true },
      { name: "Munirka", studentHub: true },
      { name: "Katwaria Sarai", studentHub: true },
      { name: "Lajpat Nagar", studentHub: false },
      { name: "Karol Bagh", studentHub: false },
      { name: "Saket", studentHub: false },
      { name: "Old Delhi", studentHub: false },
    ],
  },

  {
    slug: "gurgaon",
    name: "Gurgaon",
    editionName: "MILLENNIAL",
    state: "Haryana",
    language: "hi",
    transitAuthority: "Gurugaman",
    metroName: "Rapid Metro + Yellow Line",
    passColor: "#2C4A5E",
    fare: { base: 40, baseKm: 2.0, perKm: 15, nightMultiplier: 1.5, nightStartHour: 22 },
    transitNote:
      "Gurgaon is not built to walk. Shared autos run fixed routes along Sohna Road and Golf Course Road for ₹10–30 — learn those three routes and you can skip cabs entirely.",
    tier: 2,
    active: true,
    routes: [
      { module: "eat", code: "111", localWord: "Khaana" },
      { module: "speak", code: "112", localWord: "Bolo" },
      { module: "move", code: "113", localWord: "Chalo" },
      { module: "live", code: "115", localWord: "Raho" },
      { module: "explore", code: "117", localWord: "Ghoomo" },
    ],
    areas: [
      { name: "Sector 14", studentHub: true },
      { name: "Sushant Lok", studentHub: true },
      { name: "Sector 56", studentHub: true },
      { name: "Palam Vihar", studentHub: true },
      { name: "Sector 29", studentHub: false },
      { name: "DLF Phase 3", studentHub: false },
      { name: "Sohna Road", studentHub: false },
      { name: "Cyber City", studentHub: false },
      { name: "Golf Course Road", studentHub: false },
      { name: "Manesar", studentHub: false },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers — every consumer goes through these. No direct array access.
// ---------------------------------------------------------------------------

export const DEFAULT_CITY_SLUG = "chennai";

export const isSingleCityMode = () =>
  process.env.NEXT_PUBLIC_CITY_MODE !== "multi";

export function getCity(slug: string): City {
  return cities.find((c) => c.slug === slug && c.active) ?? cities[0]!;
}

export function activeCities(): City[] {
  return isSingleCityMode()
    ? cities.filter((c) => c.slug === DEFAULT_CITY_SLUG)
    : cities.filter((c) => c.active);
}

export function routeFor(city: City, module: ModuleKey): CityRoute {
  return city.routes.find((r) => r.module === module)!;
}

export function packFor(city: City): LanguagePack {
  return languagePacks[city.language];
}

/**
 * Fare Shield. Returns the fair fare and the price a newcomer is likely quoted.
 * `hour` is the local 24h hour — pass it in rather than reading the clock here,
 * so this stays pure and testable.
 */
export function estimateFare(city: City, km: number, hour: number) {
  const { base, baseKm, perKm, nightMultiplier, nightStartHour } = city.fare;
  const extra = Math.max(0, km - baseKm);
  const day = base + extra * perKm;
  const isNight = hour >= nightStartHour || hour < 5;
  const fair = Math.round(day * (isNight ? nightMultiplier : 1));
  return {
    fair,
    // Consistent, observed newcomer markup. Not a guess dressed as data —
    // label it as "what you'll probably be quoted" in the UI, never as a rate.
    likelyQuote: Math.round(fair * 1.7),
    isNight,
  };
}

/** Design tokens for the active city. Everything else in the palette is constant. */
export function cityTokens(city: City) {
  return {
    "--mtc": city.passColor,
    ...(city.stampOverride ? { "--stamp": city.stampOverride } : {}),
  } as React.CSSProperties;
}
