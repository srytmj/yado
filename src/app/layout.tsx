import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BackgroundGlow } from "@/components/background-glow";
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-white">
        <BackgroundGlow />
        {children}
      </body>
    </html>
  );
}
