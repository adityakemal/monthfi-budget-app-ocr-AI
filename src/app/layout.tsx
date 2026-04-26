import type { Metadata, Viewport } from "next";
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
  title: "sesaKu — Budget Tracker",
  description: "Kelola pengeluaran bulanan dengan mudah",
};

export const viewport: Viewport = {
  themeColor: "currentColor",
  width: "device-width, user-scalable=no",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${doto.variable} ${spaceGrotesk.variable} ${spaceMono.variable} bg-[var(--black)]`}
      >
        <StoreInit />
        <div className="max-w-4xl mx-auto min-h-screen relative flex flex-col bg-[var(--black)] shadow-2xl">
          {children}
        </div>
      </body>
    </html>
  );
}
