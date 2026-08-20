// Shared Chennai area coordinates — used by /move's route planner and by
// deep links from Explore ("How do I get there?"). Approximate coordinates,
// enough to rank route options by distance; not GPS-accurate.
// Includes every area used in the seeded `places` table so an Explore place
// always resolves to a known point on /move.
export const AREA_COORDS: Record<string, [number, number]> = {
  "Velachery": [12.9756, 80.2207],
  "Adyar": [13.0012, 80.2565],
  "T. Nagar": [13.0418, 80.2341],
  "Guindy": [13.0067, 80.2206],
  "Besant Nagar": [13.0002, 80.2669],
  "Anna Nagar": [13.0850, 80.2101],
  "Mylapore": [13.0339, 80.2619],
  "Tambaram": [12.9249, 80.1000],
  "Egmore": [13.0732, 80.2609],
  "Chennai Central": [13.0827, 80.2707],
  "Marina": [13.0500, 80.2824],
  "Rajaji Salai": [13.0952, 80.2901],
  "Nungambakkam": [13.0604, 80.2427],
  "Teynampet": [13.0389, 80.2492],
  "ECR, 55km": [12.6208, 80.1929],
  "Villivakkam": [13.1114, 80.2081],
  "Ashok Nagar": [13.0357, 80.2101],
  "Park Town": [13.0878, 80.2785],
  "Tondiarpet": [13.1258, 80.2897],
  "Kottivakkam": [12.9581, 80.2571],
  "Triplicane": [13.0569, 80.2757],
  "Kilpauk/Chetpet": [13.0733, 80.2415],
};

export const AREAS = Object.keys(AREA_COORDS);

/** Nearest known area name, or null if nothing is close enough to be useful. */
export function resolveArea(name: string | null | undefined): string | null {
  if (!name) return null;
  if (name in AREA_COORDS) return name;
  const lower = name.toLowerCase();
  const partial = AREAS.find((a) => lower.includes(a.toLowerCase()) || a.toLowerCase().includes(lower));
  return partial ?? null;
}

/** Road-distance estimate between two known areas (haversine × detour factor). */
export function roadKm(from: string, to: string): number {
  const [lat1, lon1] = AREA_COORDS[from];
  const [lat2, lon2] = AREA_COORDS[to];
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  const straight = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(1, Math.round(straight * 1.35)); // roads aren't straight lines
}
