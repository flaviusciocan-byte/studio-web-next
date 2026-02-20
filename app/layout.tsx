import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ConvexProviderClient from "./ConvexProviderClient";
import SiteHeader from "@/components/SiteHeader";
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
  title: {
    default: "ZARIA Builder - Text Edition",
    template: "%s | ZARIA Builder",
  },
  description:
    "ZARIA Builder - Text Edition. Build modular AI products, process source text, and ship export-ready assets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#050913] text-white antialiased`}
      >
        <ConvexProviderClient>
          <SiteHeader />
          {children}
          <footer className="border-t border-white/10 bg-[#050913]">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 text-sm text-white/60">
              <span>© {new Date().getFullYear()} ZARIA Builder</span>
              <span>Text Edition</span>
            </div>
          </footer>
        </ConvexProviderClient>
      </body>
    </html>
  );
}
