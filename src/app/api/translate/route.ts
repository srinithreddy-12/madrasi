import Anthropic from "@anthropic-ai/sdk";

// POST /api/translate — English → Chennai Tamil (DEMO-SPRINT Block B).
// Uses the Anthropic API (claude-haiku-4-5) with structured output so the
// response is always strict JSON: { tamil, roman }. The client handles the
// phrasebook fallback if this route errors (no key / network).

export const runtime = "nodejs";

const SCHEMA = {
  type: "object",
  properties: {
    tamil: { type: "string", description: "Translation in spoken Chennai Tamil script" },
    roman: { type: "string", description: "How it sounds — informal transliteration" },
    literal: { type: "string", description: "Short English gloss of what the Tamil actually says" },
  },
  required: ["tamil", "roman", "literal"],
  additionalProperties: false,
} as const;

const SYSTEM = `You translate English into SPOKEN CHENNAI TAMIL — the way a student actually
talks to an auto driver, a mess owner, or a shopkeeper. Not formal written
Tamil, not news-reader Tamil, not literary Tamil.

Rules:
- Use colloquial spoken forms. Drop formal case endings the way speech does.
- Default to the polite-casual register a 19-year-old would use with someone
  older: "anna" / "akka" where natural, "-nga" endings for politeness.
- Keep it SHORT. Spoken Tamil is shorter than written Tamil. If the English is
  8 words, the Tamil should rarely be more than 6.
- Common English loanwords stay in English, because that's how Chennai actually
  speaks: meter, auto, bus, ticket, room, bill, change, signal.
- The roman transliteration must reflect how it SOUNDS, not a formal scheme.
  Write "evlo" not "evvalavu". Write "vaanga" not "vāṅkaḷ".

Return ONLY the JSON. \`literal\` is a short English gloss of what the Tamil
actually says, which may differ from the input.`;

export async function POST(request: Request) {
  let text: string | undefined;
  try {
    ({ text } = await request.json());
  } catch {
    return Response.json({ error: "bad-request" }, { status: 400 });
  }
  if (!text || !text.trim()) {
    return Response.json({ error: "empty" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "no-key" }, { status: 500 });
  }

  const client = new Anthropic({ apiKey });
  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 256,
      system: SYSTEM,
      messages: [{ role: "user", content: text.trim().slice(0, 500) }],
      output_config: { format: { type: "json_schema", schema: SCHEMA } },
    });

    const block = msg.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") throw new Error("no text block");
    const parsed = JSON.parse(block.text) as { tamil: string; roman: string; literal: string };
    return Response.json({ tamil: parsed.tamil, roman: parsed.roman, literal: parsed.literal });
  } catch (err) {
    console.error("[translate] failed:", err);
    return Response.json({ error: "translate-failed" }, { status: 502 });
  }
}
