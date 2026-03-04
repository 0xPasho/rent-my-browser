"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const tiers = [
  { credits: 100, price: "$1", label: "100 credits" },
  { credits: 500, price: "$5", label: "500 credits" },
  { credits: 1000, price: "$10", label: "1,000 credits" },
  { credits: 5000, price: "$50", label: "5,000 credits" },
  { credits: 20000, price: "$200", label: "20,000 credits" },
];

export default function TopUpPage() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div>
      <h1 className="mb-2 font-mono text-2xl font-bold">top up credits</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        1 credit = $0.01 USD. Select a tier and pay with USDC on Base.
      </p>

      {/* Tier selector */}
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {tiers.map((tier) => (
          <button
            key={tier.credits}
            onClick={() => setSelected(tier.credits)}
            className={`rounded-xl border p-4 text-center transition-colors ${
              selected === tier.credits
                ? "border-emerald-500 bg-emerald-600/10"
                : "border-border bg-card hover:border-border/80"
            }`}
          >
            <p className="font-mono text-lg font-bold">{tier.label}</p>
            <p className="font-mono text-sm text-muted-foreground">
              {tier.price}
            </p>
          </button>
        ))}
      </div>

      {/* Payment methods */}
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-2 font-mono text-sm font-bold">
            pay with crypto (USDC on Base)
          </h2>
          <p className="mb-4 text-xs text-muted-foreground">
            Payment via x402 protocol. Your agent can also top up
            programmatically via{" "}
            <code className="text-emerald-500">
              POST /accounts/credits/crypto/:tier
            </code>
          </p>
          <Button
            disabled={!selected}
            className="bg-emerald-600 text-white hover:bg-emerald-500"
          >
            {selected
              ? `pay ${tiers.find((t) => t.credits === selected)?.price} USDC`
              : "select a tier"}
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-2 font-mono text-sm font-bold">
            pay with card (Stripe)
          </h2>
          <p className="mb-4 text-xs text-muted-foreground">
            Card payments coming soon.
          </p>
          <Button disabled variant="outline" className="border-border">
            coming soon
          </Button>
        </div>
      </div>
    </div>
  );
}
