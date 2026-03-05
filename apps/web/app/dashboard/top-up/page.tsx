"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

function getToken() {
  return document.cookie
    .split("; ")
    .find((c) => c.startsWith("rmb_session="))
    ?.split("=")[1];
}

export default function TopUpPage() {
  const [amount, setAmount] = useState("10");
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check for success/cancelled query params
  const [status, setStatus] = useState<"success" | "cancelled" | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") setStatus("success");
    if (params.get("cancelled") === "true") setStatus("cancelled");

    const token = getToken();
    if (!token) return;
    fetch(`${API_URL}/auth/session`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setBalance(data.balance ?? 0))
      .catch(() => {});
  }, []);

  const dollars = parseFloat(amount) || 0;
  const credits = Math.round(dollars * 100);
  const isValid = dollars >= 1 && dollars <= 500;

  async function handlePurchase() {
    const token = getToken();
    if (!token || !isValid) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/accounts/credits/stripe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: dollars }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "Failed to create checkout session");
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="mb-6 font-mono text-2xl font-bold">credits</h1>

      {/* Status messages */}
      {status === "success" && (
        <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="font-mono text-sm text-emerald-400">
            Payment successful! Your credits will appear shortly.
          </p>
        </div>
      )}
      {status === "cancelled" && (
        <div className="mb-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
          <p className="font-mono text-sm text-yellow-400">
            Payment cancelled. No charges were made.
          </p>
        </div>
      )}

      {/* Current balance */}
      {balance !== null && (
        <div className="mb-8 rounded-xl border border-border bg-card p-6">
          <p className="font-mono text-4xl font-bold text-emerald-500">
            ${(balance / 100).toFixed(2)}
          </p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {balance.toLocaleString()} credits
          </p>
        </div>
      )}

      {/* Buy credits */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-mono text-sm font-bold">buy credits</h2>
          <span className="font-mono text-[10px] text-muted-foreground">
            1 credit = $0.01
          </span>
        </div>

        {/* Amount input */}
        <div className="mb-4">
          <label className="mb-2 block font-mono text-xs text-muted-foreground">
            Amount (USD)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-muted-foreground">
              $
            </span>
            <Input
              type="number"
              min="1"
              max="500"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-7 font-mono"
              placeholder="10"
            />
          </div>
          {dollars > 0 && dollars < 1 && (
            <p className="mt-1 font-mono text-[10px] text-red-400">
              minimum $1
            </p>
          )}
          {dollars > 500 && (
            <p className="mt-1 font-mono text-[10px] text-red-400">
              maximum $500
            </p>
          )}
        </div>

        {/* Quick amounts */}
        <div className="mb-6 flex gap-2">
          {[1, 5, 10, 25, 50, 100].map((v) => (
            <button
              key={v}
              onClick={() => setAmount(String(v))}
              className={`rounded-lg border px-3 py-1.5 font-mono text-xs transition-colors ${
                dollars === v
                  ? "border-emerald-500 bg-emerald-600/10 text-emerald-400"
                  : "border-border text-muted-foreground hover:border-border/80"
              }`}
            >
              ${v}
            </button>
          ))}
        </div>

        {/* Summary */}
        <div className="mb-6 space-y-2 border-t border-border/50 pt-4">
          <div className="flex justify-between font-mono text-xs">
            <span className="text-muted-foreground">Credits</span>
            <span className="text-foreground">
              {isValid ? credits.toLocaleString() : "—"}
            </span>
          </div>
          <div className="flex justify-between font-mono text-sm font-bold">
            <span className="text-muted-foreground">Total due</span>
            <span className="text-foreground">
              {isValid ? `$${dollars.toFixed(2)}` : "—"}
            </span>
          </div>
        </div>

        {/* Purchase button */}
        <Button
          onClick={handlePurchase}
          disabled={!isValid || loading}
          className="w-full bg-emerald-600 py-5 font-mono text-sm font-bold text-white hover:bg-emerald-500"
        >
          {loading ? "redirecting..." : "purchase"}
        </Button>

        {error && (
          <p className="mt-3 font-mono text-xs text-red-400">{error}</p>
        )}

        <p className="mt-4 text-center font-mono text-[10px] text-muted-foreground">
          Payments processed securely by Stripe. No card data is stored.
        </p>
      </div>

      {/* Crypto note */}
      <div className="mt-4 rounded-xl border border-border bg-card p-5">
        <h2 className="mb-2 font-mono text-sm font-bold">
          pay with crypto (agents)
        </h2>
        <p className="text-xs text-muted-foreground">
          AI agents can top up programmatically via x402 (USDC on Base) using{" "}
          <code className="text-emerald-500">
            POST /accounts/credits/crypto/:tier
          </code>
          . See the{" "}
          <a
            href="/api-docs"
            className="text-emerald-500 underline underline-offset-4 hover:text-emerald-400"
          >
            API docs
          </a>
          .
        </p>
      </div>
    </div>
  );
}
