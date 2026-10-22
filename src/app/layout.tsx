import type { Metadata } from "next";
import { DM_Sans, Fraunces, Inter, Libre_Baskerville, Literata, Newsreader } from "next/font/google";
import { BottomNav } from "@/components/order/bottom-nav";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
});

const libreBaskerville = Libre_Baskerville({
  variable: "--font-libre-baskerville",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Solo Cafe - Vende directo a tus clientes",
  description: "Sistema de pedidos para recoger sin comisiones de marketplace. Tu menú, tus pagos, tu marca.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${dmSans.variable} ${inter.variable} ${fraunces.variable} ${literata.variable} ${newsreader.variable} ${libreBaskerville.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
