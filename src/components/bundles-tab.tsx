"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useSupabaseAuth } from "@/lib/supabase/auth-provider";
import type { Bundle } from "@/lib/types";
import { inr } from "@/lib/format";
import { awardXpOnce } from "@/lib/xp";

export function BundlesTab() {
  const { session } = useSupabaseAuth();
  const userId = session?.user.id ?? null;

  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [ready, setReady] = useState(false);
  const [reserve, setReserve] = useState<Bundle | null>(null);

  useEffect(() => {
    supabase
      .from("bundles")
      .select("*")
      .order("popular", { ascending: false })
      .then(({ data }) => {
        setBundles((data ?? []) as Bundle[]);
        setReady(true);
      });
  }, []);

  async function confirmReserve(b: Bundle) {
    if (userId) void awardXpOnce(userId, "live", 10, `bundle-reserve:${b.id}`);
    setReserve(null);
  }

  const waLink = (b: Bundle) =>
    `https://wa.me/?text=${encodeURIComponent(
      `Hi MADRASI — I'd like to reserve the "${b.name}" bundle (${inr(b.price)}). Please confirm delivery.`,
    )}`;

  return (
    <div className="flex flex-col gap-3">
      {!ready ? (
        <p className="t-body text-muted">Loading bundles…</p>
      ) : bundles.length === 0 ? (
        <p className="t-body text-muted">No bundles yet.</p>
      ) : (
        bundles.map((b) => (
          <div key={b.id} className="relative flex flex-col gap-3 rounded-block bg-live-tint p-5">
            {b.popular && (
              <span className="t-chip absolute right-4 top-4 rounded-full bg-live px-3 py-1 text-white">
                POPULAR
              </span>
            )}
            <div className="pr-16">
              <p className="t-title text-ink">{b.name}</p>
              <p className="t-body text-muted">{b.tagline}</p>
            </div>

            <div className="flex flex-wrap items-end gap-2">
              <span className="t-stat text-live">{inr(b.price)}</span>
              <span className="t-label text-muted line-through">{inr(b.mrp)}</span>
              <span className="t-chip rounded-full bg-live px-2.5 py-1 text-white">
                SAVE {inr(b.mrp - b.price)}
              </span>
            </div>

            <ul className="flex flex-col gap-1.5">
              {b.items.map((it) => (
                <li key={it} className="t-body flex items-start gap-2 text-ink">
                  <Check size={15} className="mt-1 shrink-0 text-live" />
                  {it}
                </li>
              ))}
            </ul>

            <p className="t-micro text-muted">
              {b.seller} · ships in {b.ships_in}
            </p>

            <button
              type="button"
              onClick={() => setReserve(b)}
              className="t-subtitle w-full rounded-full bg-live py-3 text-white [transition:transform_120ms_ease-out] active:scale-[0.98]"
            >
              Reserve this bundle
            </button>
          </div>
        ))
      )}

      {ready && bundles.length > 0 && (
        <p className="t-micro px-1 text-muted">
          Fulfilled by verified wholesale partners. MADRASI earns 15–20% commission.
        </p>
      )}

      {/* Reserve confirmation sheet (no payments) */}
      <AnimatePresence>
        {reserve && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button aria-label="Close" onClick={() => setReserve(null)} className="absolute inset-0 bg-ink/40" />
            <motion.div
              role="dialog"
              aria-label={`Reserve ${reserve.name}`}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.28, ease: "easeOut" }}
              className="relative z-10 w-full max-w-[440px] rounded-t-[28px] bg-surface p-5"
            >
              <div aria-hidden="true" className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
              <p className="t-title text-ink">{reserve.name}</p>
              <p className="t-stat mt-1 text-live">{inr(reserve.price)}</p>
              <p className="t-body mt-2 text-muted">We&apos;ll WhatsApp you to confirm delivery.</p>
              <a
                href={waLink(reserve)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => confirmReserve(reserve)}
                className="t-subtitle mt-4 block w-full rounded-full bg-live py-3 text-center text-white"
              >
                Confirm on WhatsApp
              </a>
              <button
                onClick={() => setReserve(null)}
                className="t-label mt-2 w-full rounded-full py-2 text-muted"
              >
                Not now
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
