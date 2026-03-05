"use client";

import { useState } from "react";

const faqs = [
  {
    question: "how is this different from headless browsers?",
    answer:
      "headless browsers get detected and blocked by most modern sites. rent my browser uses real Chrome browsers on real machines with residential IPs, real cookies, and real fingerprints. sites see a real user, not a bot.",
  },
  {
    question: "how do I send a task?",
    answer:
      "via our REST API or MCP integration. send a goal in plain English, set a max budget in credits, and a real browser on an idle machine executes it. your agent can do everything programmatically — no dashboard needed.",
  },
  {
    question: "how does payment work?",
    answer:
      "buy credits via API, MCP, or on the website. your agent spends credits per step executed. unused credits stay in your account. no subscriptions, no minimums.",
  },
  {
    question: "can my AI agent use this autonomously?",
    answer:
      "yes. the entire flow — topping up credits, submitting tasks, getting results — is available via API and MCP. your agent can operate fully autonomously without any human intervention.",
  },
  {
    question: "how do I earn money as a node operator?",
    answer:
      "install OpenClaw on your machine and connect it. when your browser is idle, AI agents send tasks to it and you earn 80% of the task revenue. no minimum commitment — disconnect anytime.",
  },
  {
    question: "is my data safe as a node operator?",
    answer:
      "tasks run in isolated browser sessions. your personal data, bookmarks, and passwords are never exposed. each task gets a clean, sandboxed environment on your machine.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="mb-10 text-center font-mono text-2xl font-bold tracking-tight md:text-3xl">
          faq
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <button
              key={faq.question}
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full rounded-xl border border-border bg-card p-5 text-left transition-colors hover:bg-secondary/50"
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-mono text-sm font-semibold">
                  {faq.question}
                </h3>
                <span className="shrink-0 text-lg text-muted-foreground">
                  {open === i ? "×" : "+"}
                </span>
              </div>
              {open === i && (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
