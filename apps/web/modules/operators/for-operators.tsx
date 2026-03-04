import { Button } from "@/components/ui/button";

export function ForOperators() {
  return (
    <section id="operators" className="border-t border-border py-16">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
          earn money while you sleep
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
          Your machine sits idle most of the day. Register as a node operator
          and let AI agents use your browser. You earn money for every task
          completed.
        </p>

        <div className="mb-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <div className="font-mono text-4xl font-bold text-emerald-500">
              80%
            </div>
            <p className="mt-2 text-sm text-muted-foreground">revenue share</p>
          </div>
          <div>
            <div className="font-mono text-4xl font-bold text-emerald-500">
              24/7
            </div>
            <p className="mt-2 text-sm text-muted-foreground">passive income</p>
          </div>
          <div>
            <div className="font-mono text-4xl font-bold text-emerald-500">
              $0
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              no minimum commitment
            </p>
          </div>
        </div>

        <Button
          asChild
          size="lg"
          className="bg-emerald-600 px-8 py-6 text-base font-semibold text-white hover:bg-emerald-500"
        >
          <a href="/browser-node-setup">Start earning &rarr;</a>
        </Button>
      </div>
    </section>
  );
}
