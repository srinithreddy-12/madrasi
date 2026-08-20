import type { Metadata, Viewport } from "next";
import { Anek_Latin, Anek_Tamil, DM_Mono } from "next/font/google";
import "./globals.css";
import { SupabaseAuthProvider } from "@/lib/supabase/auth-provider";
import { BottomNav } from "@/components/bottom-nav";
import { GrainOverlay } from "@/components/grain-overlay";
import { StatusStrip } from "@/components/status-strip";

// Anek superfamily: Latin + Tamil share one baseline and weight axis, so the
// bilingual UI won't look bolted together. `wdth` is included for the condensed
// (width 75) signage headings; `wght` is always included for variable fonts.
const anekLatin = Anek_Latin({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-anek-latin",
});

const anekTamil = Anek_Tamil({
  subsets: ["tamil"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-anek-tamil",
});

// DM Mono is not a variable font — weights must be listed. Every number in the
// app (fares, distances, route numbers, XP) is set in this.
const dmMono = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-mono",
});

export const metadata: Metadata = {
  title: "MADRASI",
  description: "A student survival companion for Chennai.",
};

export const viewport: Viewport = {
  themeColor: "#efe4ce",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${anekLatin.variable} ${anekTamil.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh font-sans">
        <SupabaseAuthProvider>
          {/* The phone. A centred 420px column that sits on the manila backdrop
              like an object — hard 2px ink border, flat 8px offset shadow, no
              blur (STYLE-v1.1 §2). Full bleed: no horizontal gutters. */}
          <div className="relative mx-auto flex min-h-dvh w-full max-w-[420px] flex-col border-2 border-ink bg-manila shadow-[8px_8px_0_0_var(--ink)]">
            <StatusStrip />
            <main className="flex-1">{children}</main>
            <BottomNav />
          </div>
          <GrainOverlay />
        </SupabaseAuthProvider>
      </body>
    </html>
  );
}
