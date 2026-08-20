// MTC bus routes useful to students. The first 10 are the official MTC
// route data as of 7 Aug 2026 (route-guide screenshot); 5C and 23C are added
// from the /move "useful routes" callout so the callout has stop-level detail.
export type BusRoute = {
  number: string;
  mainRoute: string;
  majorStops: string[];
};

export const BUS_ROUTES: BusRoute[] = [
  { number: "102", mainRoute: "Island Ground → Kelambakkam", majorStops: ["Island Ground", "Secretariat", "Chepauk", "QMC", "Adyar O.T.", "Indira Nagar", "SRP Tools", "Kandanchavadi", "Thoraipakkam", "Karapakkam", "Sholinganallur", "Semmancheri", "Navalur", "Kelambakkam"] },
  { number: "60A", mainRoute: "Royapuram → Kundrathur", majorStops: ["Royapuram", "Parrys", "Central", "DMS", "Saidapet", "Guindy", "St. Thomas Mount", "Airport", "Pallavaram", "Pammal", "Anakaputhur", "Kundrathur"] },
  { number: "5E", mainRoute: "Broadway → Besant Nagar", majorStops: ["Broadway", "Central", "Egmore", "Teynampet", "Adyar", "Besant Nagar"] },
  { number: "21G", mainRoute: "Broadway → Tambaram", majorStops: ["Broadway", "Central", "Guindy", "Airport", "Pallavaram", "Chromepet", "Tambaram"] },
  { number: "27D", mainRoute: "Anna Nagar → Broadway", majorStops: ["Anna Nagar", "Aminjikarai", "Kilpauk", "Egmore", "Central", "Broadway"] },
  { number: "29C", mainRoute: "Perambur → Anna Nagar", majorStops: ["Perambur", "Ayanavaram", "Kilpauk", "Aminjikarai", "Anna Nagar"] },
  { number: "70", mainRoute: "CMBT/Koyambedu → Thiruvanmiyur", majorStops: ["Koyambedu", "Vadapalani", "Ashok Nagar", "Guindy", "Adyar", "Thiruvanmiyur"] },
  { number: "570", mainRoute: "CMBT → Kelambakkam", majorStops: ["Koyambedu", "Guindy", "Adyar", "Thoraipakkam", "Sholinganallur", "Navalur", "Kelambakkam"] },
  { number: "570X", mainRoute: "CMBT → Kelambakkam (express)", majorStops: ["Koyambedu", "Guindy", "OMR", "Sholinganallur", "Navalur", "Kelambakkam"] },
  { number: "70A", mainRoute: "Broadway → Thiruvanmiyur", majorStops: ["Broadway", "Central", "Teynampet", "Adyar", "Thiruvanmiyur"] },
  { number: "5C", mainRoute: "Parry's Corner → Besant Nagar", majorStops: ["Parry's Corner", "Anna Salai", "Teynampet", "Adyar Depot", "Besant Nagar"] },
  { number: "23C", mainRoute: "Velachery → Chennai Central", majorStops: ["Velachery", "Guindy", "Saidapet", "Egmore", "Chennai Central"] },
];
