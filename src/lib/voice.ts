// Voice utilities (DEMO-SPRINT Block B + VOICE.md §3). Browser-only; SSR-safe.
// All audio must be user-initiated (call from a tap).
//
// Voice selection (VOICE.md fallback chain):
//   ta-IN voice → any ta voice → speak the ROMAN transliteration with an en-IN
//   voice and signal `onApproximate` so the UI can show a pronunciation note.
// Never falls silent — something always plays.

let voiceCache: SpeechSynthesisVoice[] = [];

function refreshVoices() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const v = window.speechSynthesis.getVoices();
  if (v.length) voiceCache = v;
}

// Voices load async — prime now and refresh on `voiceschanged` so the first tap
// has a populated list.
if (typeof window !== "undefined" && window.speechSynthesis) {
  refreshVoices();
  window.speechSynthesis.addEventListener?.("voiceschanged", refreshVoices);
}

function tamilVoice(): SpeechSynthesisVoice | undefined {
  return (
    voiceCache.find((v) => v.lang === "ta-IN") ??
    voiceCache.find((v) => v.lang?.toLowerCase().startsWith("ta"))
  );
}
function enInVoice(): SpeechSynthesisVoice | undefined {
  return (
    voiceCache.find((v) => v.lang === "en-IN") ??
    voiceCache.find((v) => v.lang?.toLowerCase().startsWith("en"))
  );
}

/** True if a Tamil TTS voice is installed. */
export function tamilVoiceAvailable(): boolean {
  refreshVoices();
  return Boolean(tamilVoice());
}

type SpeakUnit = { text: string; roman?: string; rate?: number; pitch?: number };

function makeUtterance(u: SpeakUnit, onApproximate?: () => void): SpeechSynthesisUtterance {
  const ta = tamilVoice();
  let content = u.text;
  let lang = "ta-IN";
  let voice = ta;

  // No Tamil voice at all → say the roman with an English (India) voice.
  if (!ta && u.roman) {
    content = u.roman;
    lang = "en-IN";
    voice = enInVoice();
    onApproximate?.();
  }

  const utter = new SpeechSynthesisUtterance(content);
  utter.lang = lang;
  utter.rate = u.rate ?? 0.9; // slightly slow reads as deliberate, less robotic
  utter.pitch = u.pitch ?? 1;
  utter.volume = 1;
  if (voice) utter.voice = voice;
  return utter;
}

/** User sound preference (Profile → Settings). Defaults to on. */
export function soundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem("madrasi_sound") !== "off";
}

export function speak(
  text: string,
  opts: { rate?: number; pitch?: number; roman?: string; onApproximate?: () => void } = {},
): void {
  if (typeof window === "undefined" || !window.speechSynthesis || !soundEnabled()) return;
  refreshVoices();
  const utter = makeUtterance(
    { text, roman: opts.roman, rate: opts.rate, pitch: opts.pitch },
    opts.onApproximate,
  );
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

export type SequenceLine = { text: string; roman?: string; rate?: number; pitch?: number };

/**
 * Speak lines in sequence with a gap between each (scenario playback). A 450ms
 * gap between speakers is what makes it read as dialogue, not a monologue.
 * Returns a handle whose stop() cancels the rest; onIndex fires per line.
 */
export function speakSequence(
  lines: SequenceLine[],
  opts: { gapMs?: number; onIndex?: (i: number) => void; onDone?: () => void; onApproximate?: () => void } = {},
): { stop: () => void } {
  const { gapMs = 450, onIndex, onDone, onApproximate } = opts;
  if (typeof window === "undefined" || !window.speechSynthesis || !soundEnabled()) {
    onDone?.();
    return { stop: () => {} };
  }
  refreshVoices();
  const synth = window.speechSynthesis;
  synth.cancel();
  let cancelled = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const speakAt = (i: number) => {
    if (cancelled) return;
    if (i >= lines.length) {
      onDone?.();
      return;
    }
    onIndex?.(i);
    const utter = makeUtterance(lines[i], onApproximate);
    const next = () => {
      if (cancelled) return;
      timer = setTimeout(() => speakAt(i + 1), gapMs);
    };
    utter.onend = next;
    utter.onerror = next;
    synth.speak(utter);
  };

  speakAt(0);
  return {
    stop: () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      synth.cancel();
      onDone?.();
    },
  };
}

/** Whether the browser exposes SpeechRecognition (Chrome/Edge; not Firefox/Safari). */
export function speechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
}

type DictationHandlers = {
  lang?: string;
  onResult: (transcript: string) => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
};

export function startDictation({
  lang = "en-IN",
  onResult,
  onEnd,
  onError,
}: DictationHandlers): { stop: () => void } | null {
  if (!speechRecognitionSupported()) return null;

  const Ctor =
    (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike })
      .webkitSpeechRecognition ??
    (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike })
      .SpeechRecognition;
  if (!Ctor) return null;

  const rec = new Ctor();
  rec.lang = lang;
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  rec.onresult = (e) => {
    const transcript = e.results?.[0]?.[0]?.transcript ?? "";
    if (transcript) onResult(transcript);
  };
  rec.onend = () => onEnd?.();
  rec.onerror = (e) => onError?.(e.error ?? "error");
  rec.start();
  return rec;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: (event: { results?: Array<Array<{ transcript?: string }>> }) => void;
  onend: () => void;
  onerror: (event: { error?: string }) => void;
  start: () => void;
  stop: () => void;
}
