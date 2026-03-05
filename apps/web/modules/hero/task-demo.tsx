"use client";

import { useEffect, useState } from "react";

const STEPS = [
  {
    action: 'Navigate to amazon.com',
    status: "running" as const,
    screenshot: null,
  },
  {
    action: 'Search for "iPhone 16 Pro Max"',
    status: "running" as const,
    screenshot: null,
  },
  {
    action: "Extract price, rating, and availability",
    status: "running" as const,
    screenshot: null,
  },
  {
    action: "Capture screenshot of results page",
    status: "running" as const,
    screenshot: null,
  },
];

const RESULT = {
  product: "iPhone 16 Pro Max",
  price: "$1,199.00",
  rating: "4.6 / 5",
  availability: "In Stock",
  seller: "Apple",
};

type Phase = "idle" | "submitting" | "step" | "done";

export function TaskDemo() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [currentStep, setCurrentStep] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);

  // Auto-play once
  useEffect(() => {
    if (hasPlayed) return;
    const timer = setTimeout(() => {
      runDemo();
    }, 1500);
    return () => clearTimeout(timer);
  }, [hasPlayed]);

  function runDemo() {
    setHasPlayed(true);
    setPhase("submitting");
    setCurrentStep(0);

    setTimeout(() => {
      setPhase("step");
      let step = 0;
      const interval = setInterval(() => {
        step++;
        if (step >= STEPS.length) {
          clearInterval(interval);
          setTimeout(() => setPhase("done"), 800);
        } else {
          setCurrentStep(step);
        }
      }, 1000);
    }, 1200);
  }

  function handleReplay() {
    setPhase("idle");
    setCurrentStep(0);
    setTimeout(runDemo, 500);
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
      {/* Title bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
          <span className="ml-2 font-mono text-xs text-muted-foreground">
            task execution
          </span>
        </div>
        {phase === "done" && (
          <button
            onClick={handleReplay}
            className="cursor-pointer font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground"
          >
            replay
          </button>
        )}
      </div>

      <div className="p-4 font-mono text-xs leading-relaxed sm:text-sm">
        {/* Goal */}
        <div className="mb-3">
          <span className="text-muted-foreground">goal: </span>
          <span className="text-foreground">
            &quot;Get the price of iPhone 16 Pro Max on Amazon&quot;
          </span>
        </div>

        {/* Status line */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-muted-foreground">status: </span>
          {phase === "idle" && (
            <span className="text-yellow-400">waiting...</span>
          )}
          {phase === "submitting" && (
            <span className="text-yellow-400">
              queued
              <span className="animate-pulse"> ...</span>
            </span>
          )}
          {phase === "step" && (
            <span className="text-blue-400">
              running
              <span className="animate-pulse"> ...</span>
            </span>
          )}
          {phase === "done" && (
            <span className="text-emerald-400">completed</span>
          )}
        </div>

        {/* Steps */}
        <div className="space-y-1.5 border-t border-border/50 pt-3">
          {STEPS.map((step, i) => {
            const isVisible =
              phase === "step"
                ? i <= currentStep
                : phase === "done"
                  ? true
                  : false;
            const isCurrent = phase === "step" && i === currentStep;
            const isDone = phase === "done" || (phase === "step" && i < currentStep);

            if (!isVisible) return null;

            return (
              <div
                key={i}
                className={`flex items-center gap-2 transition-opacity duration-300 ${
                  isVisible ? "opacity-100" : "opacity-0"
                }`}
              >
                {isDone ? (
                  <span className="text-emerald-500">+</span>
                ) : (
                  <span className="animate-pulse text-blue-400">&gt;</span>
                )}
                <span
                  className={
                    isDone ? "text-muted-foreground" : "text-foreground"
                  }
                >
                  step {i + 1}: {step.action}
                </span>
              </div>
            );
          })}
        </div>

        {/* Result */}
        {phase === "done" && (
          <div className="mt-4 border-t border-border/50 pt-3">
            <div className="mb-2 text-emerald-500">result:</div>
            <div className="rounded-md bg-background/50 p-3">
              {Object.entries(RESULT).map(([key, value]) => (
                <div key={key}>
                  <span className="text-muted-foreground">
                    &quot;{key}&quot;:{" "}
                  </span>
                  <span className="text-emerald-400">&quot;{value}&quot;</span>
                </div>
              ))}
            </div>
            <div className="mt-2 text-muted-foreground/60">
              4 steps - 12s - 40 credits ($0.40)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
