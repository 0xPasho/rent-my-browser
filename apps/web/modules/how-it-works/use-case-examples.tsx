const examples = [
  {
    goal: "Get price of iPhone 16 Pro Max on Amazon",
    steps: 4,
    time: "12s",
    cost: "$0.40",
    result: {
      product: "iPhone 16 Pro Max 256GB",
      price: "$1,199.00",
      rating: "4.6/5 (2,847 reviews)",
      availability: "In Stock - Ships tomorrow",
    },
  },
  {
    goal: "Sign up on waitlist at example.com with email test@demo.com",
    steps: 6,
    time: "23s",
    cost: "$0.90",
    result: {
      status: "Signed up successfully",
      confirmation: "Check your email for verification",
      position: "#4,291 on waitlist",
    },
  },
  {
    goal: "Get the top 5 trending repositories on GitHub",
    steps: 3,
    time: "8s",
    cost: "$0.15",
    result: {
      "1": "openai/codex - AI coding agent",
      "2": "vercel/ai - Build AI apps",
      "3": "langchain/langchain - LLM framework",
      "4": "anthropics/claude-code - CLI for Claude",
      "5": "microsoft/autogen - Multi-agent framework",
    },
  },
];

export function UseCaseExamples() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="mb-3 text-center text-3xl font-bold tracking-tight md:text-4xl">
          describe what you need.{" "}
          <span className="text-emerald-500">get structured results.</span>
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
          Send a goal in plain English. Your task runs on a real browser. You get
          back extracted data, screenshots, and confirmation — all via API.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {examples.map((ex) => (
            <div
              key={ex.goal}
              className="flex flex-col rounded-xl border border-border bg-card p-5"
            >
              {/* Goal */}
              <p className="mb-4 text-sm font-medium leading-snug text-foreground">
                &quot;{ex.goal}&quot;
              </p>

              {/* Metadata */}
              <div className="mb-4 flex gap-3 font-mono text-[10px] text-muted-foreground">
                <span>{ex.steps} steps</span>
                <span>{ex.time}</span>
                <span>{ex.cost}</span>
              </div>

              {/* Result */}
              <div className="flex-1 rounded-lg bg-background/50 p-3 font-mono text-xs">
                {Object.entries(ex.result).map(([key, value]) => (
                  <div key={key} className="mb-0.5">
                    <span className="text-muted-foreground">{key}: </span>
                    <span className="text-emerald-400">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
