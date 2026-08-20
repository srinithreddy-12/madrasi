import type { Metadata, Viewport } from "next";
import { Gabarito, Space_Grotesk, Anek_Tamil } from "next/font/google";
import "./globals.css";
import { SupabaseAuthProvider } from "@/lib/supabase/auth-provider";
import { BottomNav } from "@/components/bottom-nav";

// STYLE-v2 type families: Gabarito for display/headings/buttons, Space Grotesk
// for body + every numeral, Anek Tamil for SPEAK's Tamil script.
const gabarito = Gabarito({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
  variable: "--font-gabarito",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-space-grotesk",
});

const anekTamil = Anek_Tamil({
  subsets: ["tamil"],
  weight: ["500", "700"],
  display: "swap",
  variable: "--font-anek-tamil",
});

export const metadata: Metadata = {
  title: "MADRASI",
  description: "A student survival companion for Chennai.",
};

export const viewport: Viewport = {
  themeColor: "#f6f3ee",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${gabarito.variable} ${spaceGrotesk.variable} ${anekTamil.variable} h-full antialiased`}
    >
      <body className="min-h-dvh font-grotesk">
        <SupabaseAuthProvider>
          {/* Centred phone column on the warm off-white page. */}
          <div className="relative mx-auto flex min-h-dvh w-full max-w-[440px] flex-col bg-bg">
            <main className="flex-1 pb-24">{children}</main>
            <BottomNav />
          </div>
        </SupabaseAuthProvider>
      </body>
    </html>
  );
}
