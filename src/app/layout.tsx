import type { Metadata } from "next";
import { Fraunces, Shippori_Mincho, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { ReactLenis } from "lenis/react";
import { BackgroundGlow } from "@/components/background-glow";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { CommandPaletteProvider } from "@/components/interactive/command-palette-provider";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
});

const shipporiMincho = Shippori_Mincho({
  variable: "--font-shippori-mincho",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const generalSans = localFont({
  variable: "--font-general-sans",
  display: "swap",
  src: [
    { path: "./fonts/general-sans/GeneralSans-Light.woff2", weight: "300", style: "normal" },
    { path: "./fonts/general-sans/GeneralSans-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/general-sans/GeneralSans-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/general-sans/GeneralSans-Semibold.woff2", weight: "600", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "Yado - a place to stay",
  description: "One roof for every self-hosted service, portal, and project in the Yado network.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${generalSans.variable} ${shipporiMincho.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="relative min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <ReactLenis root>
            <BackgroundGlow />
            <Navbar />
            <CommandPaletteProvider />
            {children}
          </ReactLenis>
        </ThemeProvider>
      </body>
    </html>
  );
}
