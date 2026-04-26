import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono, Doto } from "next/font/google";
import { StoreInit } from "@/components";
import "./globals.css";

const doto = Doto({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-doto",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MonthFi — Budget Tracker",
  description: "Kelola pengeluaran bulanan dengan mudah",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${doto.variable} ${spaceGrotesk.variable} ${spaceMono.variable}`}>
        <StoreInit />
        {children}
      </body>
    </html>
  );
}