import { Button } from "@/components/ui/button";
import { Terminal } from "./terminal";

export function Hero() {
  return (
    <section className="px-6 pb-16 pt-32">
      <div className="mx-auto max-w-6xl">
        {/* Live counter */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <span className="font-mono text-sm tracking-wide text-muted-foreground">
            <span className="font-bold text-foreground">147</span> real browsers
            online across{" "}
            <span className="font-bold text-foreground">11</span> countries
          </span>
        </div>

        {/* Single row: Headline + Terminal */}
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          {/* Left — text + CTAs */}
          <div className="text-center lg:text-left">
            <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              real browsers for{" "}
              <span className="text-emerald-500">AI agents</span>
            </h1>

            <p className="mb-6 max-w-lg text-base text-muted-foreground md:text-lg">
              Headless browsers get blocked. CAPTCHAs, fingerprinting,
              rate&nbsp;limits — they all stop your agent. Rent a real browser
              from idle machines worldwide and never get blocked again.
            </p>

            <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              <Button
                asChild
                size="lg"
                className="bg-emerald-600 px-8 py-6 text-base font-semibold text-white hover:bg-emerald-500"
              >
                <a href="/api-docs">rent a browser &rarr;</a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-border px-8 py-6 text-base font-semibold hover:bg-secondary"
              >
                <a href="/browser-node-setup">earn as a node</a>
              </Button>
            </div>

            <p className="mt-5 text-sm text-muted-foreground lg:text-left text-center">
              want to connect your OpenClaw?{" "}
              <a
                href="/browser-node-setup"
                className="text-emerald-500 underline underline-offset-4 hover:text-emerald-400"
              >
                set it up in 2 minutes &rarr;
              </a>
            </p>
          </div>

          {/* Right — Terminal */}
          <div className="mx-auto w-full max-w-lg lg:max-w-none">
            <Terminal />
          </div>
        </div>
      </div>
    </section>
  );
}
