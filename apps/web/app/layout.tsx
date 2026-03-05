import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import { Toaster } from "sonner";
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
  title: "rent my browser — AI needs your browser",
  description:
    "Marketplace where AI agents rent real browsers. Your browser sits idle. AI agents need one. Get paid while you sleep.",
  openGraph: {
    title: "rent my browser",
    description: "AI needs your browser. Get paid while you sleep.",
    url: "https://rentmybrowser.dev",
    siteName: "rent my browser",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "rent my browser",
    description: "AI needs your browser. Get paid while you sleep.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script defer src="https://analytics.pasho.dev/script.js" data-website-id="9ec852f2-ea28-427d-88d5-334b9ad864e3" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <Providers>{children}</Providers>
        <Toaster theme="dark" position="bottom-right" richColors />
      </body>
    </html>
  );
}
