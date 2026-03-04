import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const included = [
  "Real Google Chrome on real machines",
  "Residential IPs worldwide",
  "Anti-detection & bot bypass",
  "Real browser fingerprints",
  "Screenshots & extracted data returned",
  "Unused credits stay in your account",
];

export function Pricing() {
  return (
    <section id="pricing" className="py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
          simple pricing. pay per step.
        </h2>
        <p className="mb-12 text-muted-foreground">
          Buy credits. Your agent spends them. That&apos;s it.
        </p>

        {/* Price */}
        <div className="mb-4 flex items-baseline justify-center gap-3">
          <span className="font-mono text-5xl font-bold md:text-6xl">
            $0.05
          </span>
          <span className="text-2xl text-muted-foreground">—</span>
          <span className="font-mono text-5xl font-bold md:text-6xl">
            $0.15
          </span>
        </div>
        <p className="mb-2 text-lg text-muted-foreground">per step</p>
        <p className="mb-10 text-sm text-muted-foreground">
          price depends on task complexity. your agent picks the right browser
          automatically.
        </p>

        {/* What's included */}
        <div className="mx-auto mb-10 grid max-w-md gap-3 text-left">
          {included.map((item) => (
            <div key={item} className="flex items-center gap-2.5 text-sm">
              <Check className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* Top up options */}
        <p className="mb-6 text-xs text-muted-foreground">
          top up via API, MCP, or directly on the website
        </p>

        <Button
          asChild
          size="lg"
          className="bg-emerald-600 px-8 py-6 text-base font-semibold text-white hover:bg-emerald-500"
        >
          <a href="/dashboard">Get your API key &rarr;</a>
        </Button>
      </div>
    </section>
  );
}
