"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./client";
import { demoSeedEnabled, seedDemoIfNeeded } from "../demo";
import { dailyLogin } from "../xp";

type SupabaseAuthState = {
  /** Current auth session, or null while it is being established. */
  session: Session | null;
  /** True until the first session (existing or freshly created) is resolved. */
  loading: boolean;
};

const SupabaseAuthContext = createContext<SupabaseAuthState>({
  session: null,
  loading: true,
});

/** Read the anonymous (or upgraded) Supabase session anywhere in the tree. */
export function useSupabaseAuth(): SupabaseAuthState {
  return useContext(SupabaseAuthContext);
}

/**
 * Ensures every visitor has a Supabase session on first load. If none exists,
 * signs in anonymously — zero signup friction, upgradeable to email later.
 */
export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // Keep local state in sync with token refreshes and future sign-ins.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) setSession(nextSession);
    });

    (async () => {
      const {
        data: { session: existing },
      } = await supabase.auth.getSession();

      if (!active) return;

      let resolved = existing;
      if (!resolved) {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) {
          // Most likely cause: anonymous sign-ins are disabled in the
          // Supabase project's Auth settings.
          console.error("[supabase] anonymous sign-in failed:", error.message);
        } else {
          resolved = data.session;
        }
      }

      // Seed the demo pass (gated, idempotent) BEFORE we drop `loading`, so
      // screens fetch a populated account rather than racing the insert.
      if (resolved && demoSeedEnabled) {
        try {
          await seedDemoIfNeeded(resolved.user.id);
        } catch (e) {
          console.error("[demo] seed threw:", e);
        }
      }

      // Daily login (+10 XP, streak) — idempotent per day; runs before screens
      // fetch so the numbers are already current.
      if (resolved) {
        try {
          await dailyLogin(resolved.user.id);
        } catch (e) {
          console.error("[daily-login] threw:", e);
        }
      }

      if (!active) return;
      if (resolved) setSession(resolved);
      setLoading(false);
    })();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <SupabaseAuthContext.Provider value={{ session, loading }}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}
