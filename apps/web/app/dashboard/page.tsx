"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

interface Account {
  id: string;
  type: "consumer" | "operator";
  walletAddress: string | null;
  email: string | null;
  balance: number;
  totalSpent: number;
  totalEarned: number;
}

function getToken() {
  return document.cookie
    .split("; ")
    .find((c) => c.startsWith("rmb_session="))
    ?.split("=")[1];
}

export default function DashboardOverview() {
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    fetch(`${API_URL}/auth/session`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setAccount)
      .catch(() => {});
  }, []);

  if (!account) {
    return (
      <p className="font-mono text-sm text-muted-foreground">loading...</p>
    );
  }

  const stats = [
    {
      label: "balance",
      value: account.balance.toLocaleString(),
      sub: `$${(account.balance / 100).toFixed(2)} USD`,
      color: "text-emerald-500",
    },
    {
      label: "total spent",
      value: account.totalSpent.toLocaleString(),
      sub: `$${(account.totalSpent / 100).toFixed(2)}`,
      color: "text-foreground",
    },
    {
      label: "total earned",
      value: account.totalEarned.toLocaleString(),
      sub: `$${(account.totalEarned / 100).toFixed(2)}`,
      color: "text-foreground",
    },
  ];

  return (
    <div>
      <h1 className="mb-6 font-mono text-2xl font-bold">overview</h1>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-5"
          >
            <p className="mb-1 font-mono text-xs text-muted-foreground">
              {stat.label}
            </p>
            <p className={`font-mono text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              {stat.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="mb-4 font-mono text-lg font-bold">quick actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="bg-emerald-600 text-white hover:bg-emerald-500">
            <Link href="/dashboard/top-up">top up credits</Link>
          </Button>
          <Button asChild variant="outline" className="border-border hover:bg-secondary">
            <Link href="/dashboard/tasks">view tasks</Link>
          </Button>
          <Button asChild variant="outline" className="border-border hover:bg-secondary">
            <Link href="/dashboard/settings">account settings</Link>
          </Button>
        </div>
      </div>

      {/* Account info */}
      <div>
        <h2 className="mb-4 font-mono text-lg font-bold">account</h2>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="space-y-3 text-sm">
            {account.walletAddress && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">wallet</span>
                <span className="font-mono text-xs">
                  {account.walletAddress.slice(0, 6)}...
                  {account.walletAddress.slice(-4)}
                </span>
              </div>
            )}
            {account.email && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">email</span>
                <span className="font-mono text-xs">{account.email}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
