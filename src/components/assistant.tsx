"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, MessageCircle, Mic, Send, X } from "lucide-react";
import { useSupabaseAuth } from "@/lib/supabase/auth-provider";
import { awardXpOnce } from "@/lib/xp";
import { isoDate } from "@/lib/format";
import { startDictation, speechRecognitionSupported } from "@/lib/voice";
import { MODULE_BY_KEY, type ModuleKey } from "@/lib/modules";

const PRESETS = [
  "Dinner under ₹100 near me",
  'How do I say "stop here" in Tamil?',
  "Cheapest way to Chennai Central",
  "Nearest 24×7 pharmacy",
  "Fair auto fare to T. Nagar",
  "Mess under ₹3000 a month",
  "What do I need for day one at a hostel?",
];

type Msg = { role: "user" | "assistant"; content: string; module?: ModuleKey };

// Which app section (if any) an answer points to — first keyword match wins.
function detectModule(text: string): ModuleKey | null {
  const t = text.toLowerCase();
  if (/laundry|detergent|bundle|wash|iron/.test(t)) return "live";
  if (/tamil|phrase|pronoun|"|say /.test(t)) return "speak";
  if (/auto|bus|metro|train|fare|transport|share|cab/.test(t)) return "move";
  if (/beach|temple|visit|weekend|explore|sightsee/.test(t)) return "explore";
  if (/food|mess|tiffin|biryani|idli|dosa|breakfast|dinner|lunch|eat|canteen/.test(t)) return "eat";
  return null;
}

export function Assistant() {
  const { session } = useSupabaseAuth();
  const userId = session?.user.id ?? null;

  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [listening, setListening] = useState(false);
  const micOk = speechRecognitionSupported();

  async function ask(q: string) {
    const text = q.trim();
    if (!text || busy) return;
    setFailed(false);
    const next: Msg[] = [...msgs, { role: "user", content: text }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, content: m.content })) }),
      });
      if (!res.ok) throw new Error("assistant error");
      const data = (await res.json()) as { reply: string };
      const reply = data.reply || "Sorry, I didn't catch that.";
      setMsgs((m) => [...m, { role: "assistant", content: reply, module: detectModule(reply) ?? undefined }]);
      if (userId) void awardXpOnce(userId, "speak", 5, `assistant:${isoDate()}`);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  function mic() {
    setListening(true);
    startDictation({
      onResult: (t) => {
        setInput(t);
        void ask(t);
      },
      onEnd: () => setListening(false),
      onError: () => setListening(false),
    });
  }

  return (
    <>
      {/* Floating button — 48px, forest, 64px above the bottom nav */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ask Circle"
        className="pressable shadow-pop fixed bottom-[calc(64px+env(safe-area-inset-bottom))] right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-speak text-white"
      >
        <MessageCircle size={22} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button aria-label="Close" onClick={() => setOpen(false)} className="scrim absolute inset-0" />
            <motion.div
              role="dialog"
              aria-label="Circle assistant"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              className="shadow-raised relative z-10 flex h-[78dvh] w-full max-w-[440px] flex-col rounded-t-block bg-bg"
            >
              <div aria-hidden="true" className="mx-auto mt-2 h-1.5 w-11 rounded-full bg-line-strong" />
              <div className="flex items-center justify-between px-5 pb-2 pt-3">
                <p className="t-title text-ink">Ask Circle</p>
                <button onClick={() => setOpen(false)} aria-label="Close">
                  <X size={22} className="text-muted" />
                </button>
              </div>

              <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 pb-2">
                {(msgs.length === 0 || failed) && (
                  <div className="flex flex-col gap-2">
                    {failed && (
                      <p className="t-body text-muted">
                        Couldn&apos;t reach the assistant — try a suggestion, or use the tabs below.
                      </p>
                    )}
                    {[PRESETS.slice(0, 4), PRESETS.slice(4)].map((row, ri) => (
                      <div key={ri} className="flex gap-2 overflow-x-auto pb-1">
                        {row.map((p) => (
                          <button
                            key={p}
                            onClick={() => ask(p)}
                            className="t-chip shrink-0 whitespace-nowrap rounded-full border border-line bg-surface px-3.5 py-2 text-ink"
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {msgs.map((m, i) =>
                  m.role === "user" ? (
                    <div key={i} className="max-w-[85%] self-end rounded-card bg-ink px-4 py-2.5">
                      <p className="t-body text-white">{m.content}</p>
                    </div>
                  ) : (
                    <div key={i} className="flex max-w-[90%] flex-col gap-2 self-start">
                      <div className="rounded-card bg-speak-tint px-4 py-3">
                        <p className="t-body text-ink">{m.content}</p>
                      </div>
                      {m.module && (
                        <Link
                          href={MODULE_BY_KEY[m.module].path}
                          onClick={() => setOpen(false)}
                          className="t-chip flex items-center gap-1 self-start rounded-full bg-speak px-4 py-2 text-white"
                        >
                          Open {MODULE_BY_KEY[m.module].label.toUpperCase()} <ArrowRight size={14} />
                        </Link>
                      )}
                    </div>
                  ),
                )}

                {busy && (
                  <div className="self-start rounded-card bg-speak-tint px-4 py-3">
                    <p className="t-body text-muted">…</p>
                  </div>
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void ask(input);
                }}
                className="flex gap-2 border-t border-line p-3 pb-[calc(12px+env(safe-area-inset-bottom))]"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything…"
                  className="t-body min-w-0 flex-1 rounded-full border border-line bg-surface px-4 py-2.5 text-ink placeholder:text-muted focus:outline-none"
                />
                {micOk && (
                  <button
                    type="button"
                    onClick={mic}
                    aria-label="Dictate"
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                      listening ? "bg-live text-white" : "bg-speak-tint text-speak"
                    }`}
                  >
                    <Mic size={18} />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={busy}
                  aria-label="Send"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-speak text-white disabled:opacity-60"
                >
                  <Send size={18} />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
