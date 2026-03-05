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

const SITE_URL = "https://rentmybrowser.dev";
const SITE_NAME = "rent my browser";
const DEFAULT_DESCRIPTION =
  "Marketplace where AI agents rent real browsers. Send a task in plain English, a real browser executes it, get screenshots and data back. Earn money by sharing your idle browser.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "rent my browser — real browsers for AI agents",
    template: "%s — rent my browser",
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "AI browser automation",
    "rent browser",
    "real browser API",
    "anti-detection browser",
    "web scraping API",
    "CAPTCHA bypass",
    "browser automation",
    "AI agent tools",
    "MCP browser",
    "headless browser alternative",
    "browser as a service",
    "earn passive income",
    "browser node operator",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  openGraph: {
    title: "rent my browser — real browsers for AI agents",
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "rent my browser — real browsers for AI agents",
    description:
      "Your AI agent sends a task. A real browser executes it. You get screenshots, data, and results back.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
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
