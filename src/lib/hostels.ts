// PG & hostel listings for students — no MADRASI Supabase table for this yet,
// so this stays static TS data (same pattern as bus-routes.ts) rather than
// forcing a schema change for content mostly sourced from a ranked screenshot.
// Only the top 3 rows had fully confirmed amenities/pricing in the source;
// the rest are ranked/rated but genuinely "contact to confirm" — shown as such
// rather than invented.
export type Hostel = {
  id: string;
  name: string;
  area: string;
  gender: "men" | "women" | "any";
  rating: number | null; // public rating, out of 5 — null where the source had none
  studentRating: number; // MADRASI-scale /10 from the source ranking
  priceLabel: string;
  priceVerified: boolean;
  amenities: {
    food: string;
    wifi: string;
    laundry: string;
    housekeeping: string;
    security: string;
    water: string;
  };
  amenitiesVerified: boolean;
};

export const HOSTELS: Hostel[] = [
  {
    id: "snk-hostels",
    name: "SNK Hostels",
    area: "Thousand Lights",
    gender: "any",
    rating: 4.2,
    studentRating: 9.5,
    priceLabel: "₹7,500–₹10,500/mo",
    priceVerified: true,
    amenities: { food: "3 meals", wifi: "Yes", laundry: "Washing machine", housekeeping: "Daily", security: "24/7", water: "RO + 24/7" },
    amenitiesVerified: true,
  },
  {
    id: "om-muruga-mens-hostel",
    name: "Om Muruga Men's Hostel",
    area: "Koyambedu",
    gender: "men",
    rating: null,
    studentRating: 9.3,
    priceLabel: "₹7,000–₹7,500/mo",
    priceVerified: true,
    amenities: { food: "3 meals", wifi: "Yes", laundry: "Free laundry", housekeeping: "Included", security: "Included", water: "Included" },
    amenitiesVerified: true,
  },
  {
    id: "sumathi-illam",
    name: "Sumathi Illam",
    area: "Ayanavaram / Anna Nagar / Koyambedu",
    gender: "any",
    rating: null,
    studentRating: 9.0,
    priceLabel: "₹4,500–₹5,000/mo + food",
    priceVerified: true,
    amenities: { food: "Extra (paid separately)", wifi: "Yes", laundry: "Basic", housekeeping: "Included", security: "Biometric", water: "Included" },
    amenitiesVerified: true,
  },
  {
    id: "hostel-gandhi",
    name: "Hostel Gandhi",
    area: "Ekkatuthangal",
    gender: "any",
    rating: 4.6,
    studentRating: 8.8,
    priceLabel: "Contact for price",
    priceVerified: false,
    amenities: { food: "Contact to confirm", wifi: "Contact to confirm", laundry: "Contact to confirm", housekeeping: "Contact to confirm", security: "Contact to confirm", water: "Contact to confirm" },
    amenitiesVerified: false,
  },
  {
    id: "sps-mens-pg",
    name: "SPS Men's PG",
    area: "Thousand Lights",
    gender: "men",
    rating: 4.8,
    studentRating: 8.7,
    priceLabel: "Contact for price",
    priceVerified: false,
    amenities: { food: "Contact to confirm", wifi: "Contact to confirm", laundry: "Contact to confirm", housekeeping: "Contact to confirm", security: "Contact to confirm", water: "Contact to confirm" },
    amenitiesVerified: false,
  },
  {
    id: "sri-venkateswara-mens-hostel",
    name: "Sri Venkateswara Men's Hostel",
    area: "Thousand Lights",
    gender: "men",
    rating: 4.7,
    studentRating: 8.6,
    priceLabel: "Contact for price",
    priceVerified: false,
    amenities: { food: "Contact to confirm", wifi: "Contact to confirm", laundry: "Contact to confirm", housekeeping: "Contact to confirm", security: "Contact to confirm", water: "Contact to confirm" },
    amenitiesVerified: false,
  },
  {
    id: "station-amman-mens-pg-hostel",
    name: "Station Amman Men's PG Hostel",
    area: "Choolaimedu",
    gender: "men",
    rating: 4.9,
    studentRating: 8.6,
    priceLabel: "Contact for price",
    priceVerified: false,
    amenities: { food: "Contact to confirm", wifi: "Contact to confirm", laundry: "Contact to confirm", housekeeping: "Contact to confirm", security: "Contact to confirm", water: "Contact to confirm" },
    amenitiesVerified: false,
  },
  {
    id: "pb44-amman-mens-pg-hostels",
    name: "PB44 Amman Men's PG Hostels",
    area: "Arumbakkam",
    gender: "men",
    rating: 4.4,
    studentRating: 8.3,
    priceLabel: "Contact for price",
    priceVerified: false,
    amenities: { food: "Contact to confirm", wifi: "Contact to confirm", laundry: "Contact to confirm", housekeeping: "Contact to confirm", security: "Contact to confirm", water: "Contact to confirm" },
    amenitiesVerified: false,
  },
  {
    id: "ojas-grand-pg-for-men",
    name: "Ojas Grand PG for Men",
    area: "Perungudi",
    gender: "men",
    rating: 4.5,
    studentRating: 8.4,
    priceLabel: "Contact for price",
    priceVerified: false,
    amenities: { food: "Contact to confirm", wifi: "Contact to confirm", laundry: "Contact to confirm", housekeeping: "Contact to confirm", security: "Contact to confirm", water: "Contact to confirm" },
    amenitiesVerified: false,
  },
  {
    id: "sns-gents-hostel-pg",
    name: "SNS Gents Hostel PG",
    area: "Thoraipakkam",
    gender: "men",
    rating: 4.6,
    studentRating: 8.4,
    priceLabel: "Contact for price",
    priceVerified: false,
    amenities: { food: "Contact to confirm", wifi: "Contact to confirm", laundry: "Contact to confirm", housekeeping: "Contact to confirm", security: "Contact to confirm", water: "Contact to confirm" },
    amenitiesVerified: false,
  },
  {
    id: "springs-home-womens-pg",
    name: "Springs Home Women's PG",
    area: "Thoraipakkam/OMR",
    gender: "women",
    rating: 4.8,
    studentRating: 8.8,
    priceLabel: "Contact for price",
    priceVerified: false,
    amenities: { food: "Contact to confirm", wifi: "Contact to confirm", laundry: "Contact to confirm", housekeeping: "Contact to confirm", security: "Contact to confirm", water: "Contact to confirm" },
    amenitiesVerified: false,
  },
  {
    id: "thaai-womens-hostel-pg",
    name: "Thaai Women's Hostel & PG",
    area: "Kodambakkam",
    gender: "women",
    rating: 4.4,
    studentRating: 8.4,
    priceLabel: "Contact for price",
    priceVerified: false,
    amenities: { food: "Contact to confirm", wifi: "Contact to confirm", laundry: "Contact to confirm", housekeeping: "Contact to confirm", security: "Contact to confirm", water: "Contact to confirm" },
    amenitiesVerified: false,
  },
];
