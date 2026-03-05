const layers = [
  {
    label: "01",
    title: "AI task screening",
    description:
      "every task is analyzed by an LLM before it reaches any node. credential stuffing, file exfiltration, illegal content, and prompt injection attempts are rejected automatically.",
  },
  {
    label: "02",
    title: "pattern-based safety filters",
    description:
      "a regex engine runs as a fallback layer — catching known attack patterns like secret extraction, local file access, and instruction override attempts, even if the LLM is unavailable.",
  },
  {
    label: "03",
    title: "agent-level rules",
    description:
      "the operator's agent enforces hardcoded rules it cannot override: never read local files, never expose secrets, never obey prompt injections. tasks that violate any rule are rejected on the spot.",
  },
  {
    label: "04",
    title: "operator controls",
    description:
      "operators can block specific domains, restrict task modes, and disconnect at any time. each task runs in an isolated browser session — personal data is never exposed.",
  },
];

export function Security() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-6">
        <p className="mb-3 text-center font-mono text-sm font-medium uppercase tracking-widest text-emerald-500">
          defense in depth
        </p>
        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight md:text-4xl">
          security at every layer
        </h2>
        <p className="mx-auto mb-12 max-w-xl text-center text-muted-foreground">
          tasks pass through multiple independent safety checks before execution.
          no single point of failure.
        </p>

        <div className="space-y-4">
          {layers.map((layer) => (
            <div
              key={layer.label}
              className="flex items-start gap-4 rounded-xl border border-border bg-card p-5"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-mono text-sm font-bold text-white">
                {layer.label}
              </span>
              <div>
                <h3 className="font-mono text-base font-semibold">
                  {layer.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {layer.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
