"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

interface ShowcaseStep {
  step_number: number;
  action: string;
  screenshot_url: string | null;
}

interface ShowcaseTask {
  task_id: string;
  goal: string;
  tier: string;
  mode: string;
  steps_completed: number;
  actual_cost: number | null;
  duration_ms: number | null;
  completed_at: string;
  extracted_data: Record<string, unknown>;
  final_url?: string;
  steps: ShowcaseStep[];
}

interface FallbackTask {
  goal: string;
  tier: string;
  steps: number;
  duration: string;
  cost: string;
  result: Record<string, string>;
}

const FALLBACK_EXAMPLES: FallbackTask[] = [
  {
    goal: "Get price of iPhone 16 Pro Max on Amazon",
    tier: "real",
    steps: 4,
    duration: "12s",
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
    tier: "real",
    steps: 6,
    duration: "23s",
    cost: "$0.90",
    result: {
      status: "Signed up successfully",
      confirmation: "Check your email for verification",
      position: "#4,291 on waitlist",
    },
  },
  {
    goal: "Get the top 5 trending repositories on GitHub",
    tier: "headless",
    steps: 3,
    duration: "8s",
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

function formatDuration(ms: number) {
  return ms >= 60000 ? `${(ms / 60000).toFixed(1)}m` : `${(ms / 1000).toFixed(0)}s`;
}

function formatCost(credits: number) {
  return `$${(credits / 100).toFixed(2)}`;
}

export function Showcase() {
  const [tasks, setTasks] = useState<ShowcaseTask[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/showcase`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.tasks?.length) setTasks(data.tasks);
        setLoaded(true);
        if (window.location.hash === "#showcase") {
          setTimeout(() => {
            document.getElementById("showcase")?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }
      })
      .catch(() => setLoaded(true));
  }, []);

  const hasRealTasks = tasks.length > 0;

  return (
    <section id="showcase" className="border-t border-border py-20">
      <div className="mx-auto max-w-5xl px-6">
        <p className="mb-3 text-center font-mono text-sm font-medium uppercase tracking-widest text-emerald-500">
          {hasRealTasks ? "live from the network" : "what you can do"}
        </p>
        <h2 className="mb-3 text-center text-3xl font-bold tracking-tight md:text-4xl">
          {hasRealTasks ? (
            <>real tasks. <span className="text-muted-foreground">real results.</span></>
          ) : (
            <>describe what you need. <span className="text-emerald-500">get structured results.</span></>
          )}
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
          {hasRealTasks
            ? "These tasks were executed by real browsers on real machines through the marketplace. Click to see the full execution."
            : "Send a goal in plain English. Your task runs on a real browser. You get back extracted data, screenshots, and confirmation — all via API."}
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hasRealTasks
            ? tasks.map((task) => (
                <RealTaskCard
                  key={task.task_id}
                  task={task}
                  isExpanded={expandedId === task.task_id}
                  onToggle={() => setExpandedId(expandedId === task.task_id ? null : task.task_id)}
                  onLightbox={setLightbox}
                />
              ))
            : FALLBACK_EXAMPLES.map((ex) => (
                <FallbackCard key={ex.goal} task={ex} />
              ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt="Screenshot"
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
          />
        </div>
      )}
    </section>
  );
}

function RealTaskCard({
  task,
  isExpanded,
  onToggle,
  onLightbox,
}: {
  task: ShowcaseTask;
  isExpanded: boolean;
  onToggle: () => void;
  onLightbox: (url: string) => void;
}) {
  const firstScreenshot = task.steps.find((s) => s.screenshot_url);

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card transition-colors hover:border-emerald-500/30">
      {firstScreenshot?.screenshot_url && (
        <div
          className="cursor-pointer overflow-hidden rounded-t-xl border-b border-border"
          onClick={() => onLightbox(firstScreenshot.screenshot_url!)}
        >
          <img
            src={firstScreenshot.screenshot_url}
            alt={`Screenshot for: ${task.goal}`}
            className="h-40 w-full object-cover object-top transition-transform hover:scale-105"
            loading="lazy"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <p className="mb-3 line-clamp-2 text-sm font-medium leading-snug text-foreground">
          &quot;{task.goal}&quot;
        </p>

        <div className="mb-3 flex flex-wrap gap-2 font-mono text-[10px]">
          <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-400">
            completed
          </span>
          <span className="rounded bg-secondary px-1.5 py-0.5 text-muted-foreground">
            {task.tier}
          </span>
          <span className="rounded bg-secondary px-1.5 py-0.5 text-muted-foreground">
            {task.steps_completed} steps
          </span>
          {task.duration_ms != null && (
            <span className="rounded bg-secondary px-1.5 py-0.5 text-muted-foreground">
              {formatDuration(task.duration_ms)}
            </span>
          )}
          {task.actual_cost != null && (
            <span className="rounded bg-secondary px-1.5 py-0.5 text-muted-foreground">
              {formatCost(task.actual_cost)}
            </span>
          )}
        </div>

        {Object.keys(task.extracted_data).length > 0 && (
          <div className="mb-3 flex-1 overflow-hidden rounded-lg bg-background/50 p-3 font-mono text-xs">
            {Object.entries(task.extracted_data)
              .filter(([, value]) => typeof value !== "object" || value === null)
              .slice(0, 3)
              .map(([key, value]) => (
                <div key={key} className="mb-0.5 truncate">
                  <span className="text-muted-foreground">{key}: </span>
                  <span className="text-emerald-400">{String(value ?? "")}</span>
                </div>
              ))}
            {Object.entries(task.extracted_data).filter(([, v]) => typeof v !== "object" || v === null).length > 3 && (
              <span className="text-muted-foreground/50">
                +{Object.entries(task.extracted_data).filter(([, v]) => typeof v !== "object" || v === null).length - 3} more
              </span>
            )}
          </div>
        )}

        <button
          onClick={onToggle}
          className="mt-auto cursor-pointer font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground"
        >
          {isExpanded ? "hide steps" : `show ${task.steps.length} steps`}
        </button>

        {isExpanded && (
          <div className="mt-3 space-y-2 border-t border-border/50 pt-3">
            {task.steps.map((step) => (
              <div key={step.step_number}>
                <div className="flex items-start gap-2 text-xs">
                  <span className="shrink-0 font-mono text-emerald-500">
                    {step.step_number}.
                  </span>
                  <span className="text-muted-foreground">{step.action}</span>
                </div>
                {step.screenshot_url && (
                  <img
                    src={step.screenshot_url}
                    alt={`Step ${step.step_number}`}
                    className="mt-1.5 max-h-32 cursor-pointer rounded border border-border object-contain transition-opacity hover:opacity-80"
                    onClick={() => onLightbox(step.screenshot_url!)}
                    loading="lazy"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FallbackCard({ task }: { task: FallbackTask }) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-5">
      <p className="mb-3 line-clamp-2 text-sm font-medium leading-snug text-foreground">
        &quot;{task.goal}&quot;
      </p>

      <div className="mb-3 flex flex-wrap gap-2 font-mono text-[10px]">
        <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-400">
          completed
        </span>
        <span className="rounded bg-secondary px-1.5 py-0.5 text-muted-foreground">
          {task.tier}
        </span>
        <span className="rounded bg-secondary px-1.5 py-0.5 text-muted-foreground">
          {task.steps} steps
        </span>
        <span className="rounded bg-secondary px-1.5 py-0.5 text-muted-foreground">
          {task.duration}
        </span>
        <span className="rounded bg-secondary px-1.5 py-0.5 text-muted-foreground">
          {task.cost}
        </span>
      </div>

      <div className="flex-1 overflow-hidden rounded-lg bg-background/50 p-3 font-mono text-xs">
        {Object.entries(task.result).map(([key, value]) => (
          <div key={key} className="mb-0.5 truncate">
            <span className="text-muted-foreground">{key}: </span>
            <span className="text-emerald-400">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
