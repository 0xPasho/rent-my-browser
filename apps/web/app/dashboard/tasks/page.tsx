"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

interface Task {
  task_id: string;
  goal: string;
  status: string;
  actual_cost: number | null;
  estimated_cost: number | null;
  steps_completed: number;
  estimated_steps: number | null;
  created_at: string;
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

const placeholders = [
  "Scrape the top 10 results from Google for 'best coffee in NYC'",
  "Go to github.com/trending and extract the repo names",
  "Fill out the contact form at example.com with test data",
  "Take a screenshot of the homepage of stripe.com",
  "Search for flights from SF to LA on Google Flights",
];

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [goal, setGoal] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [placeholder] = useState(
    () => placeholders[Math.floor(Math.random() * placeholders.length)]
  );

  const fetchTasks = useCallback(() => {
    const token = getToken();
    if (!token) return;

    fetch(`${API_URL}/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setTasks(data.tasks ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!goal.trim()) return;

    const token = getToken();
    if (!token) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          goal: goal.trim(),
          max_budget: 500,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? `Error ${res.status}`);
      }

      const data = await res.json();
      setGoal("");
      fetchTasks();
      router.push(`/dashboard/tasks/${data.task_id}`);
    } catch (err: any) {
      setSubmitError(err.message ?? "Failed to submit task");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="mb-6 font-mono text-2xl font-bold">tasks</h1>

      {/* New task form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="rounded-xl border border-border bg-card p-4">
          <label className="mb-2 block font-mono text-xs text-muted-foreground">
            what do you need a browser to do?
          </label>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-emerald-600 focus:outline-none"
          />
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              max budget: 500 credits
            </p>
            <Button
              type="submit"
              disabled={submitting || goal.trim().length < 10}
              className="bg-emerald-600 text-white hover:bg-emerald-500"
            >
              {submitting ? "submitting..." : "submit task"}
            </Button>
          </div>
          {submitError && (
            <p className="mt-2 text-sm text-red-400">{submitError}</p>
          )}
        </div>
      </form>

      {/* Task list */}
      {loading ? (
        <p className="font-mono text-sm text-muted-foreground">loading...</p>
      ) : tasks.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="mb-2 font-mono text-sm text-muted-foreground">
            no tasks yet — submit one above to get started
          </p>
          <p className="text-xs text-muted-foreground">
            You can also submit tasks via{" "}
            <a
              href="/api-docs"
              className="text-emerald-500 underline underline-offset-4 hover:text-emerald-400"
            >
              API
            </a>{" "}
            or{" "}
            <a
              href="/mcp"
              className="text-emerald-500 underline underline-offset-4 hover:text-emerald-400"
            >
              MCP
            </a>
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card">
                <th className="px-4 py-3 text-left font-mono text-xs font-medium text-muted-foreground">
                  Goal
                </th>
                <th className="px-4 py-3 text-left font-mono text-xs font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-mono text-xs font-medium text-muted-foreground">
                  Steps
                </th>
                <th className="px-4 py-3 text-left font-mono text-xs font-medium text-muted-foreground">
                  Cost
                </th>
                <th className="px-4 py-3 text-left font-mono text-xs font-medium text-muted-foreground">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr
                  key={task.task_id}
                  onClick={() => router.push(`/dashboard/tasks/${task.task_id}`)}
                  className="cursor-pointer border-b border-border/50 last:border-0 hover:bg-secondary/50 transition-colors"
                >
                  <td className="max-w-xs truncate px-4 py-3 text-xs text-foreground">
                    {task.goal}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-medium ${
                        statusColors[task.status] ?? "text-muted-foreground"
                      }`}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {task.steps_completed}
                    {task.estimated_steps ? `/${task.estimated_steps}` : ""}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {task.actual_cost ?? task.estimated_cost ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {new Date(task.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
