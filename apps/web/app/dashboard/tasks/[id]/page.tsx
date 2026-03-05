"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

interface Step {
  step_number: number;
  action: string;
  screenshot_url: string | null;
  created_at: string;
}

interface TaskResult {
  screenshots: string[];
  extracted_data: Record<string, unknown>;
  final_url?: string;
  files?: { name: string; url: string }[];
}

interface TaskDetail {
  task_id: string;
  goal: string;
  status: string;
  tier: string;
  mode: string;
  complexity: string;
  steps_completed: number;
  estimated_steps: number | null;
  estimated_cost: number | null;
  actual_cost: number | null;
  max_budget: number;
  result: TaskResult | null;
  duration_ms: number | null;
  steps: Step[];
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

function getToken() {
  return document.cookie
    .split("; ")
    .find((c) => c.startsWith("rmb_session="))
    ?.split("=")[1];
}

const statusColors: Record<string, string> = {
  completed: "bg-emerald-500/10 text-emerald-400",
  failed: "bg-red-500/10 text-red-400",
  running: "bg-blue-500/10 text-blue-400",
  queued: "bg-yellow-500/10 text-yellow-400",
  claimed: "bg-yellow-500/10 text-yellow-400",
};

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;

  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedScreenshot, setExpandedScreenshot] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    fetch(`${API_URL}/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load task");
        return res.json();
      })
      .then((data) => {
        setTask(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [taskId]);

  if (loading) {
    return (
      <p className="font-mono text-sm text-muted-foreground">loading...</p>
    );
  }

  if (error || !task) {
    return (
      <div>
        <Button
          variant="ghost"
          className="mb-4 font-mono text-xs text-muted-foreground"
          onClick={() => router.push("/dashboard/tasks")}
        >
          &larr; back to tasks
        </Button>
        <p className="font-mono text-sm text-red-400">
          {error || "Task not found"}
        </p>
      </div>
    );
  }

  const duration = task.duration_ms
    ? task.duration_ms >= 60000
      ? `${(task.duration_ms / 60000).toFixed(1)}m`
      : `${(task.duration_ms / 1000).toFixed(1)}s`
    : null;

  return (
    <div>
      <Button
        variant="ghost"
        className="mb-4 font-mono text-xs text-muted-foreground"
        onClick={() => router.push("/dashboard/tasks")}
      >
        &larr; back to tasks
      </Button>

      {/* Header */}
      <div className="mb-6 rounded-xl border border-border bg-card p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-medium ${
              statusColors[task.status] ?? "text-muted-foreground"
            }`}
          >
            {task.status}
          </span>
          <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
            {task.tier}
          </span>
          <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
            {task.mode}
          </span>
          {duration && (
            <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
              {duration}
            </span>
          )}
        </div>
        <h1 className="font-mono text-lg font-bold">{task.goal}</h1>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span>
            steps: {task.steps_completed}
            {task.estimated_steps ? `/${task.estimated_steps}` : ""}
          </span>
          <span>
            cost: {task.actual_cost ?? task.estimated_cost ?? "—"} credits
          </span>
          <span>budget: {task.max_budget} credits</span>
          <span>
            created: {new Date(task.created_at).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Steps timeline */}
      {task.steps.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-4 font-mono text-sm font-bold">
            steps ({task.steps.length})
          </h2>
          <div className="space-y-3">
            {task.steps.map((step) => (
              <div
                key={step.step_number}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-500">
                    step {step.step_number}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {new Date(step.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-foreground">{step.action}</p>
                {step.screenshot_url && (
                  <div className="mt-3">
                    <img
                      src={step.screenshot_url}
                      alt={`Step ${step.step_number} screenshot`}
                      className="max-h-64 cursor-pointer rounded-lg border border-border object-contain transition-opacity hover:opacity-80"
                      onClick={() => setExpandedScreenshot(step.screenshot_url)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {task.result && (
        <div className="mb-6">
          <h2 className="mb-4 font-mono text-sm font-bold">result</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            {/* Final URL */}
            {task.result.final_url && (
              <div>
                <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  final url
                </p>
                <a
                  href={task.result.final_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all font-mono text-xs text-emerald-500 underline underline-offset-4 hover:text-emerald-400"
                >
                  {task.result.final_url}
                </a>
              </div>
            )}

            {/* Extracted data */}
            {Object.keys(task.result.extracted_data).length > 0 && (
              <div>
                <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  extracted data
                </p>
                <pre className="overflow-x-auto rounded-lg bg-background p-3 font-mono text-xs text-foreground">
                  {JSON.stringify(task.result.extracted_data, null, 2)}
                </pre>
              </div>
            )}

            {/* Files */}
            {task.result.files && task.result.files.length > 0 && (
              <div>
                <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  files
                </p>
                <div className="space-y-1">
                  {task.result.files.map((file, i) => (
                    <a
                      key={i}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block font-mono text-xs text-emerald-500 underline underline-offset-4 hover:text-emerald-400"
                    >
                      {file.name}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Screenshots gallery */}
            {task.result.screenshots.length > 0 && (
              <div>
                <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  screenshots ({task.result.screenshots.length})
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {task.result.screenshots.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Screenshot ${i + 1}`}
                      className="cursor-pointer rounded-lg border border-border object-cover transition-opacity hover:opacity-80"
                      onClick={() => setExpandedScreenshot(url)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No result for non-completed tasks */}
      {!task.result && ["queued", "claimed", "running"].includes(task.status) && (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="font-mono text-sm text-muted-foreground">
            task is {task.status}...
          </p>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">
            results will appear here when the task completes
          </p>
        </div>
      )}

      {/* Lightbox */}
      {expandedScreenshot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setExpandedScreenshot(null)}
        >
          <img
            src={expandedScreenshot}
            alt="Expanded screenshot"
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
          />
        </div>
      )}
    </div>
  );
}
