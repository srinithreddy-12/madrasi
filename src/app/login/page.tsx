"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { NavHeader } from "@/components/nav-header";

type Mode = "signin" | "signup";
type Status = "idle" | "loading" | "error" | "sent";

// A fresh sign-in replaces the current session outright, so anyone with
// unsaved guest progress on this device should upgrade from Profile first
// (supabase.auth.updateUser keeps the same account id) rather than land
// here and lose it.
export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setStatus("error");
        setErrorMsg(error.message);
        return;
      }
      router.push("/");
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setStatus("error");
        setErrorMsg(error.message);
        return;
      }
      setStatus("sent");
    }
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      <NavHeader title={mode === "signin" ? "Sign in" : "Create account"} back={{ href: "/", label: "Home" }} />

      {mode === "signin" && (
        <p className="t-label text-muted">
          Signing in swaps in that account&apos;s progress on this device. If you&apos;ve been using Circle as a
          guest, save your guest account from Profile first so you don&apos;t lose it.
        </p>
      )}

      {status === "sent" ? (
        <div className="rounded-card border border-line bg-surface p-5 shadow-card">
          <p className="t-subtitle text-ink">Check your email</p>
          <p className="t-body mt-1 text-muted">We sent a confirmation link to {email}. Confirm it, then come back and sign in.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3 rounded-card border border-line bg-surface p-5 shadow-card">
          <label className="flex flex-col gap-1">
            <span className="t-micro text-muted">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@college.edu"
              className="t-body rounded-inner border border-line bg-bg px-3 py-2 text-ink focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="t-micro text-muted">Password</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="t-body rounded-inner border border-line bg-bg px-3 py-2 text-ink focus:outline-none"
            />
          </label>

          {status === "error" && <p className="t-label text-live">{errorMsg}</p>}

          <button
            type="submit"
            disabled={status === "loading"}
            className="t-subtitle mt-1 rounded-full bg-speak py-3 text-white disabled:opacity-60"
          >
            {status === "loading" ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
      )}

      <button
        onClick={() => {
          setMode(mode === "signin" ? "signup" : "signin");
          setStatus("idle");
          setErrorMsg("");
        }}
        className="t-label text-center text-muted"
      >
        {mode === "signin" ? "New to Circle? Create an account" : "Already have an account? Sign in"}
      </button>

      <Link href="/profile" className="t-label text-center text-muted">
        Back to Profile
      </Link>
    </div>
  );
}
