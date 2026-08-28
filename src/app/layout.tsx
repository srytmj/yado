import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ReactLenis } from "lenis/react";
import { BackgroundGlow } from "@/components/background-glow";
import { CursorSpotlight } from "@/components/interactive/cursor-spotlight";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
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
  title: "White Archive",
  description: "One archive, every White Archive microservice behind a single sign-on.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
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
            <div className="fixed right-4 top-4 z-50 rounded-full border border-foreground/10 bg-background/70 p-1">
              <ThemeToggle />
            </div>
            {children}
          </ReactLenis>
        </ThemeProvider>
      </body>
    </html>
  );
}
