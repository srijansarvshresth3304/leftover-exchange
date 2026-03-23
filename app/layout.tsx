import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  // 1. Google Search Console Verification
  // ⚠️ DHAYAN DEIN: "YAHAN_APNA_CODE_PASTE_KARO" ki jagah apna 
  // google-site-verification wala code copy-paste kar dena.
  verification: {
    google: "P7OPFqu8ZR3DZ5OT3TtOw6Rv6TU7CGlIVad0hTUBqq4", 
  },

  // 2. SEO Title (Jo Google search results mein dikhega)
  title: "L.E.🏗️ - Sasta Construction Material | Buy & Sell Leftover Items",

  // 3. SEO Description (Site ke niche jo chota text dikhta hai)
  description: "Bihar ka pehla sasta construction marketplace. Apne area mein bacha hua cement, tiles, sariya aur paint kharidein ya bechein. Sasta Saaman, Asli Log.",

  // 4. Keywords (Google ko samajhne mein help karta hai)
  keywords: [
    "construction material", 
    "leftover exchange", 
    "sasta cement", 
    "tiles buy sell", 
    "Bihar construction marketplace", 
    "contractor material deals",
    "pincode based deals"
  ],

  // 5. Open Graph (Jab tum link WhatsApp pe share karoge toh kaisa dikhega)
  openGraph: {
    title: "L.E.🏗️ - Construction Material Exchange",
    description: "Bacha hua saaman becho turant!",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}