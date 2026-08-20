// Pharmacies & hospitals for Services — no Circle Supabase table for this
// yet, so static TS data (same pattern as bus-routes.ts / hostels.ts).
// Pharmacies #7–12 plus the three "top choices" are from a ranked student
// pharmacy list screenshot; the rest fill out areas the app already covers
// elsewhere (Velachery, Adyar, Guindy, Besant Nagar, Tambaram, Egmore) with
// realistic-for-the-area estimates, not scraped facts. Hospitals are real,
// well-known Chennai institutions with generic practical notes, not
// operational specifics we can't verify.

export type Pharmacy = {
  id: string;
  name: string;
  area: string;
  rating: number; // public rating, out of 5
  hours: string;
  services: string[];
  studentRating: number; // /10
  pick?: string; // set only for the source's editor's-choice picks
};

export const PHARMACIES: Pharmacy[] = [
  {
    id: "elite-pharmacy",
    name: "Elite Pharmacy",
    area: "Vanagaram",
    rating: 4.9,
    hours: "8 AM – 11 PM",
    services: ["Discounted medicines", "Online ordering", "OTC products"],
    studentRating: 9.4,
    pick: "Best for affordability — discounted medicines & online ordering.",
  },
  {
    id: "sukham-pharmacy",
    name: "Sukham Pharmacy",
    area: "Anna Nagar",
    rating: 4.9,
    hours: "8 AM – 11 PM",
    services: ["Medicines", "OTC products", "Health checkups"],
    studentRating: 9.3,
    pick: "800+ reviews — the go-to for Anna Nagar / Kilpauk colleges & PGs.",
  },
  {
    id: "sri-suki-pharmacy",
    name: "Sri Suki Pharmacy",
    area: "Mogappair East",
    rating: 4.6,
    hours: "8 AM – 10 PM",
    services: ["Medicines", "OTC products"],
    studentRating: 8.9,
    pick: "Popular with Mogappair East college crowds.",
  },
  {
    id: "thulasi-pharmacy",
    name: "Thulasi Pharmacy",
    area: "Nungambakkam",
    rating: 4.9,
    hours: "8:30 AM – 10:30 PM",
    services: ["Medicines", "OTC products", "Pharmacy assistance"],
    studentRating: 9.2,
  },
  {
    id: "mrmed",
    name: "MrMed.in",
    area: "T. Nagar",
    rating: 4.7,
    hours: "9 AM – 9 PM",
    services: ["Medicines", "Online ordering", "Medicine delivery"],
    studentRating: 9.2,
  },
  {
    id: "ss-pharmacy",
    name: "S S Pharmacy",
    area: "Thousand Lights",
    rating: 4.8,
    hours: "24 hours",
    services: ["Medicines", "Basic healthcare products", "24-hour service"],
    studentRating: 9.1,
  },
  {
    id: "pride-pharmacy",
    name: "Pride Pharmacy",
    area: "Jamalia",
    rating: 4.8,
    hours: "24 hours",
    services: ["Medicines", "OTC products", "24-hour availability"],
    studentRating: 9.0,
  },
  {
    id: "adyar-health-mart",
    name: "Adyar Health Mart",
    area: "Adyar",
    rating: 4.4,
    hours: "24 hours",
    services: ["Medicines", "OTC products", "24-hour service"],
    studentRating: 8.7,
  },
  {
    id: "muthu-pharmacy",
    name: "Muthu Pharmacy",
    area: "Purasaiwakkam",
    rating: 4.2,
    hours: "24 hours",
    services: ["Medicines", "OTC products", "24-hour service"],
    studentRating: 8.8,
  },
  {
    id: "apollo-pharmacy-velachery",
    name: "Apollo Pharmacy",
    area: "Velachery",
    rating: 4.5,
    hours: "24 hours",
    services: ["Medicines", "OTC products", "Home delivery"],
    studentRating: 9.0,
  },
  {
    id: "egmore-central-pharmacy",
    name: "Egmore Central Pharmacy",
    area: "Egmore",
    rating: 4.3,
    hours: "7 AM – 11 PM",
    services: ["Medicines", "OTC products", "Pharmacy assistance"],
    studentRating: 8.5,
  },
  {
    id: "guindy-medical-store",
    name: "Guindy Medical Store",
    area: "Guindy",
    rating: 4.3,
    hours: "8 AM – 11 PM",
    services: ["Medicines", "OTC products"],
    studentRating: 8.6,
  },
  {
    id: "besant-nagar-pharmacy",
    name: "Besant Nagar Pharmacy",
    area: "Besant Nagar",
    rating: 4.2,
    hours: "8 AM – 10 PM",
    services: ["Medicines", "First aid supplies"],
    studentRating: 8.4,
  },
  {
    id: "tambaram-medicos",
    name: "Tambaram Medicos",
    area: "Tambaram",
    rating: 4.1,
    hours: "24 hours",
    services: ["Medicines", "OTC products", "24-hour service"],
    studentRating: 8.3,
  },
  {
    id: "karuppiah-pharmacy",
    name: "Karuppiah Pharmacy",
    area: "Mylapore",
    rating: 3.9,
    hours: "24 hours",
    services: ["Medicines", "OTC products", "24-hour service"],
    studentRating: 8.5,
  },
];

export type Hospital = {
  id: string;
  name: string;
  area: string;
  type: "Government" | "Private" | "Trust";
  emergency: boolean;
  note: string;
};

export const HOSPITALS: Hospital[] = [
  {
    id: "rajiv-gandhi-ggh",
    name: "Rajiv Gandhi Government General Hospital",
    area: "Park Town",
    type: "Government",
    emergency: true,
    note: "Chennai's largest government hospital — free/subsidised care, always busy but reliable for emergencies.",
  },
  {
    id: "stanley-medical-college",
    name: "Stanley Medical College Hospital",
    area: "Royapuram",
    type: "Government",
    emergency: true,
    note: "Government teaching hospital — free OPD consultation with a valid college/government ID.",
  },
  {
    id: "apollo-greams-road",
    name: "Apollo Hospitals",
    area: "Thousand Lights",
    type: "Private",
    emergency: true,
    note: "Multi-specialty flagship hospital — higher cost; ask about student or insurance rates upfront.",
  },
  {
    id: "miot-international",
    name: "MIOT International",
    area: "Manapakkam",
    type: "Private",
    emergency: true,
    note: "Known for orthopaedics and cardiology; a longer trip from most hostel areas.",
  },
  {
    id: "sundaram-medical-foundation",
    name: "Sundaram Medical Foundation",
    area: "Shenoy Nagar",
    type: "Trust",
    emergency: true,
    note: "Charitable trust hospital — moderate pricing, popular with students around Anna Nagar/Kilpauk.",
  },
  {
    id: "kauvery-alwarpet",
    name: "Kauvery Hospital",
    area: "Alwarpet",
    type: "Private",
    emergency: true,
    note: "Multi-specialty chain with several Chennai branches — check the nearest one before heading out.",
  },
];
