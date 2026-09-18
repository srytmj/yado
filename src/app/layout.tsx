import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ReactLenis } from "lenis/react";
import { BackgroundGlow } from "@/components/background-glow";
import { CursorSpotlight } from "@/components/interactive/cursor-spotlight";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { CommandPaletteProvider } from "@/components/interactive/command-palette-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yado - Launcher & Mission Control",
  description: "Unified entry point to microservices, identity, and production web portals behind Yado.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <ReactLenis root>
            <BackgroundGlow />
            <CursorSpotlight />
            <Navbar />
            <CommandPaletteProvider />
            {children}
          </ReactLenis>
        </ThemeProvider>
      </body>
    </html>
  );
}
