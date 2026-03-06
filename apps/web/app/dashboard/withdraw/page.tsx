"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const MINIMUM_WITHDRAW = 2000; // 2000 credits = $20

function getToken() {
  return document.cookie
    .split("; ")
    .find((c) => c.startsWith("rmb_session="))
    ?.split("=")[1];
}

export default function WithdrawPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [totalEarned, setTotalEarned] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${API_URL}/auth/session`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setBalance(data.balance ?? 0);
        setTotalEarned(data.totalEarned ?? 0);
      })
      .catch(() => {});
  }, []);

  const canWithdraw = totalEarned >= MINIMUM_WITHDRAW;

  return (
    <div>
      <h1 className="mb-6 font-mono text-2xl font-bold">withdraw</h1>

      {/* Current balance */}
      {balance !== null && (
        <div className="mb-8 rounded-xl border border-border bg-card p-6">
          <p className="font-mono text-4xl font-bold text-emerald-500">
            ${(balance / 100).toFixed(2)}
          </p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {balance.toLocaleString()} credits available
          </p>
        </div>
      )}

      {/* Earnings info */}
      <div className="mb-6 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 font-mono text-sm font-bold">earnings</h2>

        <div className="mb-4 space-y-3">
          <div className="flex justify-between font-mono text-sm">
            <span className="text-muted-foreground">total earned</span>
            <span className="font-bold text-foreground">
              ${(totalEarned / 100).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between font-mono text-sm">
            <span className="text-muted-foreground">minimum to withdraw</span>
            <span className="text-foreground">
              ${(MINIMUM_WITHDRAW / 100).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-2">
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all duration-500"
              style={{
                width: `${Math.min(100, (totalEarned / MINIMUM_WITHDRAW) * 100)}%`,
              }}
            />
          </div>
          <p className="mt-1 text-right font-mono text-[10px] text-muted-foreground">
            {canWithdraw
              ? "minimum reached"
              : `$${((MINIMUM_WITHDRAW - totalEarned) / 100).toFixed(2)} more to unlock`}
          </p>
        </div>
      </div>

      {/* Withdraw button */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-2 font-mono text-sm font-bold">request withdrawal</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Automatic withdrawals are coming soon. You need at least $20.00 in
          total earnings to request a withdrawal.
        </p>

        <Button
          onClick={() => setShowModal(true)}
          disabled={!canWithdraw}
          className="w-full bg-emerald-600 py-5 font-mono text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-40"
        >
          {canWithdraw ? "request withdrawal" : "earn $20 to unlock withdrawals"}
        </Button>

        {!canWithdraw && (
          <p className="mt-3 text-center font-mono text-[10px] text-muted-foreground">
            Start running a browser node to earn credits from AI agent tasks.
          </p>
        )}
      </div>

      {/* How to earn section */}
      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-2 font-mono text-sm font-bold">how to earn</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Connect your machine as a browser node. AI agents will send tasks
          to your browser, and you earn 80% of every step completed.
        </p>
        <Button
          asChild
          variant="outline"
          className="border-border font-mono text-xs hover:bg-secondary"
        >
          <a href="/browser-node-setup">set up a node</a>
        </Button>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-border bg-card p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 font-mono text-lg font-bold">
              withdrawal request
            </h3>

            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              Automatic withdrawals are coming soon. For now, join our Discord
              and contact us in the{" "}
              <strong className="text-foreground">#withdrawals</strong> channel
              with your account email or wallet address and the amount you want
              to withdraw.
            </p>

            <Button
              asChild
              className="w-full bg-emerald-600 py-5 font-mono text-sm font-bold text-white hover:bg-emerald-500"
            >
              <a
                href="https://discord.com/invite/Ma7GuySQ7h"
                target="_blank"
                rel="noopener noreferrer"
              >
                join Discord to withdraw
              </a>
            </Button>

            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full text-center font-mono text-xs text-muted-foreground hover:text-foreground"
            >
              close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
