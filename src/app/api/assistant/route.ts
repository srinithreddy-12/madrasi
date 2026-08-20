import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

// POST /api/assistant — MADRASI guide (SPRINT-ADD Block H). Anthropic API with
// the same key as translate. Seeded content (food/laundry/bundles, compact) is
// passed as context. Plain-text reply; the client detects any module mentioned
// and shows a deep-link chip.

export const runtime = "nodejs";

const SYSTEM =
  "You are MADRASI, a guide for outstation students new to Chennai. Answer in " +
  "2-3 short sentences. Be specific about prices in rupees and areas in Chennai. " +
  "If the student needs food, laundry, medical, transport or Tamil help, say " +
  "which section of the app to open.";

async function buildContext(): Promise<string> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return "";
  const sb = createClient(url, key, { auth: { persistSession: false } });
  const [food, laundries, bundles] = await Promise.all([
    sb.from("food_places").select("name, area, avg_price, kind").order("student_score", { ascending: false }).limit(10),
    sb.from("laundries").select("name, area, per_kg"),
    sb.from("bundles").select("name, price").order("popular", { ascending: false }).limit(6),
  ]);
  const f = (food.data ?? []).map((r) => `${r.name} (${r.area}) ~₹${r.avg_price}`).join("; ");
  const l = (laundries.data ?? []).map((r) => `${r.name} (${r.area}) ₹${r.per_kg}/kg`).join("; ");
  const b = (bundles.data ?? []).map((r) => `${r.name} ₹${r.price}`).join("; ");
  return `Food: ${f}\nLaundry: ${l}\nBundles: ${b}`;
}

type Incoming = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  let messages: Incoming[] | undefined;
  try {
    ({ messages } = await request.json());
  } catch {
    return Response.json({ error: "bad-request" }, { status: 400 });
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "empty" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return Response.json({ error: "no-key" }, { status: 500 });

  // Bound history and ensure it starts with a user turn (Anthropic requirement).
  const trimmed = messages.slice(-8).map((m) => ({
    role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
    content: String(m.content).slice(0, 1000),
  }));
  while (trimmed.length && trimmed[0].role !== "user") trimmed.shift();
  if (trimmed.length === 0) return Response.json({ error: "empty" }, { status: 400 });

  try {
    const context = await buildContext();
    const client = new Anthropic({ apiKey });
    const msg = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 300,
      system: `${SYSTEM}\n\nCurrent MADRASI content you can cite:\n${context}`,
      messages: trimmed,
    });
    const block = msg.content.find((b) => b.type === "text");
    return Response.json({ reply: block && block.type === "text" ? block.text : "" });
  } catch (err) {
    console.error("[assistant] failed:", err);
    return Response.json({ error: "assistant-failed" }, { status: 502 });
  }
}
