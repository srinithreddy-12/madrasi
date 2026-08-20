# VOICE.md — make it sound like a person

Two fixes. Do #1 first — it's free and it matters more than people expect.

---

## 1. The translation register (free, 5 min, biggest win)

The current output is almost certainly **formal written Tamil**. That is not what
anyone speaks on a Chennai street, and a TTS engine reading formal Tamil sounds
maximally robotic. Spoken Tamil is shorter, drops case endings, and uses different
words entirely.

Replace the system prompt on `/api/translate` with this:

```
You translate English into SPOKEN CHENNAI TAMIL — the way a student actually
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

Return ONLY this JSON, nothing else:
{"tamil":"...","roman":"...","literal":"..."}

`literal` is a short English gloss of what the Tamil actually says, which may
differ from the input.
```

Show the `literal` field in small muted text under the roman. It makes the app feel
knowledgeable rather than mechanical, and it's one extra line of UI.

---

## 2. Sarvam AI for the voice (~15 min)

Browser `speechSynthesis` has a hard ceiling on Tamil. Sarvam is built for Indian
languages and sounds markedly more natural.

- Sign up at sarvam.ai, get an API key, add to `.env.local` as
  `SARVAM_API_KEY=` (server-side only, no NEXT_PUBLIC prefix).
- Build a server route `/api/speak` that takes `{ text, voice }`, calls Sarvam's
  text-to-speech endpoint with `target_language_code: "ta-IN"`, and returns the audio.

**Check the current Sarvam docs for exact endpoint, parameter names, speaker names
and response format before writing this — do not assume from memory.** Their API has
changed and the speaker list is versioned.

### Voice casting
Map roles to different Sarvam speakers so conversations sound like two people, not
one person twice:

```
you      -> a younger female or male voice, slightly faster
driver   -> an older male voice, slower
shopkeeper / mess owner -> a middle-aged voice, different from driver
narrator / phrasebook   -> the clearest neutral voice
```

Pick from whatever speakers the current API offers. The point is that they must be
*audibly different* from each other.

### Pacing
- Phrasebook and translate output: slightly slower than default — the user is
  learning to repeat it.
- Scenario conversations: natural speed, with a **450ms pause between speakers**.
  The pause is what makes it read as dialogue rather than a monologue.

### Caching — do this, it matters
- Cache generated audio by a hash of `text + voice`, in memory plus `sessionStorage`.
- Every seeded phrase and every scenario line is fixed content — it should be
  generated once and then replayed instantly.
- **Pre-warm on demo night:** when the SPEAK screen mounts, silently generate audio
  for the six scenario openers in the background. On stage, the first tap is then
  instant instead of showing a 2-second spinner.

### Fallback chain — never break
```
Sarvam succeeds        -> play it
Sarvam fails or no key -> browser speechSynthesis, ta-IN voice, rate 0.9
No Tamil voice at all  -> speak the ROMAN transliteration with an en-IN voice
                          and show a small "approximate pronunciation" note
```
Never show an error, never fall silent. Something always plays.

---

## 3. If Sarvam takes more than 20 minutes, stop and tune the browser voice

Not as good, but respectable:

```js
utterance.lang  = 'ta-IN';
utterance.rate  = 0.88;   // slower reads as more deliberate, less robotic
utterance.pitch = 1.0;    // vary per role: 0.85 older male, 1.1 younger
utterance.volume = 1.0;
```

- Enumerate `speechSynthesis.getVoices()` and prefer any `ta-IN` voice, then any
  `ta`, then `en-IN`. Voices load async — listen for `voiceschanged` before picking,
  or the first call gets an empty list.
- Split long text at punctuation and queue as separate utterances with short gaps.
  Continuous long utterances are what sound most machine-like.
- Vary `pitch` per speaker role even here. Two voices at different pitches read as
  a conversation; one voice reads as a robot.

---

## VERIFY

1. Translate "how much to Guindy" — does the Tamil come back short and colloquial
   (something like "Guindy evlo?") rather than a long formal sentence?
2. Play the auto scenario — can you tell the two speakers apart by ear?
3. Tap the same phrase twice — is the second play instant (cache hit)?
4. Delete SARVAM_API_KEY, reload, tap a phrase — does the browser voice still play
   with no visible error?
