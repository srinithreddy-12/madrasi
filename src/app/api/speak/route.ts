// POST /api/speak — Sarvam AI text-to-speech (VOICE.md §2). Takes { text, voice }
// and returns { audio: "<base64 wav>" }. The client caches by hash(text+voice) and
// falls back to browser speechSynthesis if this route errors or has no key — so a
// missing key or a Sarvam outage degrades silently, never breaks playback.

export const runtime = "nodejs";

const SARVAM_URL = "https://api.sarvam.ai/text-to-speech";

// Voice casting — semantic role → a bulbul:v3 speaker. The three scenario voices
// (female / male / elder) must be AUDIBLY DIFFERENT from each other; three distinct
// speaker ids guarantees that. `narrator` is the clear neutral voice for phrasebook
// and translate output. Speaker names are case-sensitive and must be lowercase.
const SPEAKERS: Record<string, string> = {
  you: "priya", // younger, for the student's own lines
  female: "priya",
  male: "aditya",
  elder: "anand", // the older auto driver / mess owner
  narrator: "kavya",
};
const DEFAULT_SPEAKER = SPEAKERS.narrator;

type Incoming = { text?: unknown; voice?: unknown };

export async function POST(request: Request) {
  let body: Incoming;
  try {
    body = (await request.json()) as Incoming;
  } catch {
    return Response.json({ error: "bad-request" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) return Response.json({ error: "empty" }, { status: 400 });
  const voice = typeof body.voice === "string" ? body.voice : "narrator";
  const speaker = SPEAKERS[voice] ?? DEFAULT_SPEAKER;

  const apiKey = process.env.SARVAM_API_KEY;
  // No key → 503; the client treats any non-2xx as "use the browser voice".
  if (!apiKey) return Response.json({ error: "no-key" }, { status: 503 });

  try {
    const res = await fetch(SARVAM_URL, {
      method: "POST",
      headers: {
        "api-subscription-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        text: text.slice(0, 500),
        model: "bulbul:v3",
        language_code: "ta-IN",
        speaker,
      }),
    });
    if (!res.ok) {
      console.error("[speak] sarvam status", res.status);
      return Response.json({ error: "sarvam-failed" }, { status: 502 });
    }
    const data = (await res.json()) as { audios?: string[] };
    const audio = data.audios?.[0];
    if (!audio) return Response.json({ error: "no-audio" }, { status: 502 });
    return Response.json({ audio });
  } catch (err) {
    console.error("[speak] failed:", err);
    return Response.json({ error: "speak-failed" }, { status: 502 });
  }
}
