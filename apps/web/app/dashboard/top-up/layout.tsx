import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top Up Credits",
  description: "Buy credits to fund browser automation tasks. Pay with Stripe or crypto.",
};

export default function TopUpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
