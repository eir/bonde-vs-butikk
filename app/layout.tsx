import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { DM_Serif_Display } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-body",
});

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Bonde vs Butikk — Hvem får mest?",
  description:
    "Se hva norske bønder får betalt for råvarene sine, og sammenlign med prisveksten de siste 40 årene.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nb">
      <body className={`${geist.variable} ${dmSerif.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
