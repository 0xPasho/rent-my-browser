import { Button } from "@/components/ui/button";
import { TaskDemo } from "./task-demo";
import { LiveCounter } from "./live-counter";

export function Hero() {
  return (
    <section className="px-6 pb-16 pt-32">
      <div className="mx-auto max-w-6xl">
        <LiveCounter />

        {/* Single row: Headline + Demo */}
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          {/* Left — text + CTAs */}
          <div className="text-center lg:text-left">
            <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              real browsers for{" "}
              <span className="text-emerald-500">AI agents</span>
            </h1>

            <p className="mx-auto mb-2 max-w-lg text-base text-muted-foreground md:text-lg lg:mx-0">
              Your AI agent sends a task in plain English.
            </p>
            <p className="mx-auto mb-2 max-w-lg text-base text-muted-foreground md:text-lg lg:mx-0">
              A real browser on a real machine executes it.
            </p>
            <p className="mx-auto mb-6 max-w-lg text-base text-muted-foreground md:text-lg lg:mx-0">
              You get screenshots, data, and results back.
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

            <p className="mt-5 text-center text-sm text-muted-foreground lg:text-left">
              No headless flags. No bot detection. No CAPTCHAs.
            </p>
          </div>

          {/* Right — Animated task demo */}
          <div className="mx-auto w-full max-w-lg lg:max-w-none">
            <TaskDemo />
          </div>
        </div>
      </div>
    </section>
  );
}
