// Row shapes for the Supabase content + progression tables read by the screens.
// These mirror supabase/migrations/0001_init.sql (v1 Chennai).

export type Axis = "eat" | "speak" | "move" | "live" | "explore";

export type FoodPlace = {
  id: string;
  name: string;
  kind: string;
  area: string;
  cuisine: "veg" | "nonveg" | "both";
  avg_price: number;
  monthly_price: number | null;
  rating: number;
  reviews: number;
  distance_km: number;
  timings: string;
  late_night: boolean;
  delivery: boolean;
  student_score: number; // 0..100
  tags: string[];
  must_try: string[];
  phone: string | null;
  blurb: string | null;
};

export type Laundry = {
  id: string;
  name: string;
  area: string;
  per_kg: number;
  iron_per_piece: number;
  dry_clean_from: number;
  rating: number;
  reviews: number;
  distance_km: number;
  pickup: boolean;
  student_discount: string | null;
  timings: string;
  student_score: number;
  phone: string | null;
};

export type AxisTotal = { axis: Axis; total: number }; // total capped 0..100 by the view

export type Profile = {
  id: string;
  display_name: string | null;
  college_id: string | null;
  area: string;
  home_state: string | null;
  veg_pref: "veg" | "nonveg" | "both" | null;
  streak: number;
  last_active_date: string | null;
  freezes_available: number;
};

export type QuestStep = {
  label: string;
  axis: Axis;
  xp: number;
  verify?: string;
};

export type Quest = {
  id: string;
  title: string;
  description: string | null;
  axis: Axis | null;
  steps: QuestStep[];
};

export type PriceConfidence = {
  entity_type: string;
  entity_id: string;
  reported_price: number;
  confirmed_at: string;
  days_old: number;
  is_fresh: boolean;
};

export const AXES: Axis[] = ["eat", "speak", "move", "live", "explore"];
