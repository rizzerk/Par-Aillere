import type { Metadata } from "next";
import { Parisienne, Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const parisienne = Parisienne({
  variable: "--font-parisienne",
  subsets: ["latin"],
  weight: "400",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const jbMono = JetBrains_Mono({
  variable: "--font-jbmono",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Par Aillere — Homemade Artisan Cookies",
  description:
    "Thick, filled cookies made in small batches. Baked to order.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${parisienne.variable} ${cormorant.variable} ${jbMono.variable}`}
    >
      <body className="min-h-screen bg-cream text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
