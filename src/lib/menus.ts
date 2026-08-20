// Per-dish menus for /live's Eat tab. No Supabase column for this yet, so
// static TS data keyed by food_places.id — same pattern as bus-routes.ts,
// hostels.ts and medical.ts. Prices are realistic-for-the-place estimates
// anchored to each place's avg_price/monthly_price, not scraped menus.
export type MenuItem = { name: string; price: number };

export const MENUS: Record<string, MenuItem[]> = {
  "murugan-idli": [
    { name: "Ghee podi idli", price: 70 },
    { name: "Rava dosa", price: 90 },
    { name: "Sambar idli", price: 75 },
    { name: "Pongal", price: 80 },
    { name: "Vada (2 pc)", price: 50 },
    { name: "Uttapam", price: 90 },
    { name: "Filter coffee", price: 30 },
  ],
  "amma-mess": [
    { name: "Veg meals (unlimited rice)", price: 70 },
    { name: "Egg meals", price: 90 },
    { name: "Sunday chicken biryani", price: 120 },
    { name: "Vathal kuzhambu meals", price: 70 },
    { name: "Curd rice", price: 50 },
    { name: "Rasam rice", price: 60 },
  ],
  "sri-tiffin": [
    { name: "Curd rice combo", price: 60 },
    { name: "Chapati kurma box", price: 65 },
    { name: "Idli sambar box", price: 55 },
    { name: "Lemon rice box", price: 60 },
    { name: "Veg fried rice box", price: 70 },
  ],
  "jannal-kadai": [
    { name: "Bajji platter", price: 40 },
    { name: "Onion bajji (4 pc)", price: 30 },
    { name: "Banana bajji (4 pc)", price: 35 },
    { name: "Vadai", price: 25 },
    { name: "Sukku coffee", price: 15 },
    { name: "Masala tea", price: 15 },
  ],
  "buhari": [
    { name: "Chicken 65", price: 220 },
    { name: "Mutton biryani", price: 280 },
    { name: "Chicken biryani", price: 230 },
    { name: "Egg biryani", price: 150 },
    { name: "Chicken curry", price: 200 },
    { name: "Parotta (2 pc)", price: 40 },
  ],
  "hot-chips": [
    { name: "Ghee pongal", price: 90 },
    { name: "Sambar idli", price: 80 },
    { name: "Mini tiffin", price: 110 },
    { name: "Vada sambar", price: 85 },
    { name: "Rava kesari", price: 60 },
    { name: "Filter coffee", price: 30 },
  ],
  "kalathi": [
    { name: "Rose milk", price: 40 },
    { name: "Jigarthanda", price: 60 },
    { name: "Badam milk", price: 50 },
    { name: "Sweet lassi", price: 45 },
    { name: "Fruit salad with ice cream", price: 70 },
  ],
  "night-canteen": [
    { name: "Kothu parotta", price: 80 },
    { name: "Chicken kothu parotta", price: 120 },
    { name: "Omelette dosa", price: 70 },
    { name: "Egg fried rice", price: 90 },
    { name: "Plain parotta (2 pc)", price: 30 },
  ],
  "sangeetha": [
    { name: "Mini tiffin", price: 110 },
    { name: "Masala dosa", price: 120 },
    { name: "Paneer butter masala", price: 180 },
    { name: "Veg biryani", price: 150 },
    { name: "Gobi manchurian", price: 140 },
    { name: "Chapati (2 pc) with kurma", price: 100 },
  ],
  "annapurna-caterers": [
    { name: "Veg meals (per plate, bulk)", price: 95 },
    { name: "Non-veg meals (per plate, bulk)", price: 130 },
    { name: "Party biryani tray (serves 10)", price: 950 },
    { name: "Snacks box (per person)", price: 60 },
  ],
};
