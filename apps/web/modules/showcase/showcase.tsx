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

function formatDuration(ms: number) {
  return ms >= 60000 ? `${(ms / 60000).toFixed(1)}m` : `${(ms / 1000).toFixed(0)}s`;
}

function formatCost(credits: number) {
  return `$${(credits / 100).toFixed(2)}`;
}

export function Showcase() {
  const [tasks, setTasks] = useState<ShowcaseTask[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/showcase`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.tasks?.length) {
          setTasks(data.tasks);
          // Scroll to #showcase if hash matches (element didn't exist during initial load)
          if (window.location.hash === "#showcase") {
            setTimeout(() => {
              document.getElementById("showcase")?.scrollIntoView({ behavior: "smooth" });
            }, 100);
          }
        }
      })
      .catch(() => {});
  }, []);

  if (tasks.length === 0) return null;

  return (
    <section id="showcase" className="border-t border-border py-20">
      <div className="mx-auto max-w-5xl px-6">
        <p className="mb-3 text-center font-mono text-sm font-medium uppercase tracking-widest text-emerald-500">
          live from the network
        </p>
        <h2 className="mb-3 text-center text-3xl font-bold tracking-tight md:text-4xl">
          real tasks.{" "}
          <span className="text-muted-foreground">real results.</span>
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
          These tasks were executed by real browsers on real machines through the
          marketplace. Click to see the full execution.
        </p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => {
            const isExpanded = expandedId === task.task_id;
            const firstScreenshot = task.steps.find((s) => s.screenshot_url);

            return (
              <div
                key={task.task_id}
                className="flex flex-col rounded-xl border border-border bg-card transition-colors hover:border-emerald-500/30"
              >
                {/* Thumbnail */}
                {firstScreenshot?.screenshot_url && (
                  <div
                    className="cursor-pointer overflow-hidden rounded-t-xl border-b border-border"
                    onClick={() => setLightbox(firstScreenshot.screenshot_url)}
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
                  {/* Goal */}
                  <p className="mb-3 text-sm font-medium leading-snug text-foreground">
                    &quot;{task.goal}&quot;
                  </p>

                  {/* Metadata */}
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
                    {task.duration_ms && (
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

                  {/* Extracted data preview */}
                  {Object.keys(task.extracted_data).length > 0 && (
                    <div className="mb-3 flex-1 rounded-lg bg-background/50 p-3 font-mono text-xs">
                      {Object.entries(task.extracted_data)
                        .slice(0, 3)
                        .map(([key, value]) => (
                          <div key={key} className="mb-0.5 truncate">
                            <span className="text-muted-foreground">
                              {key}:{" "}
                            </span>
                            <span className="text-emerald-400">
                              {String(value)}
                            </span>
                          </div>
                        ))}
                      {Object.keys(task.extracted_data).length > 3 && (
                        <span className="text-muted-foreground/50">
                          +{Object.keys(task.extracted_data).length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Expand toggle */}
                  <button
                    onClick={() =>
                      setExpandedId(isExpanded ? null : task.task_id)
                    }
                    className="mt-auto cursor-pointer font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {isExpanded ? "hide steps" : `show ${task.steps.length} steps`}
                  </button>

                  {/* Expanded steps */}
                  {isExpanded && (
                    <div className="mt-3 space-y-2 border-t border-border/50 pt-3">
                      {task.steps.map((step) => (
                        <div key={step.step_number}>
                          <div className="flex items-start gap-2 text-xs">
                            <span className="shrink-0 font-mono text-emerald-500">
                              {step.step_number}.
                            </span>
                            <span className="text-muted-foreground">
                              {step.action}
                            </span>
                          </div>
                          {step.screenshot_url && (
                            <img
                              src={step.screenshot_url}
                              alt={`Step ${step.step_number}`}
                              className="mt-1.5 max-h-32 cursor-pointer rounded border border-border object-contain transition-opacity hover:opacity-80"
                              onClick={() => setLightbox(step.screenshot_url)}
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
          })}
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
