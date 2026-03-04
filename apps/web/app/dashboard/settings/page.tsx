"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

interface Account {
  id: string;
  type: "consumer" | "operator";
  walletAddress: string;
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

export default function SettingsPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [emailError, setEmailError] = useState("");
  const [apiKeyVisible, setApiKeyVisible] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    fetch(`${API_URL}/auth/session`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setAccount(data);
        setEmail(data.email ?? "");
      })
      .catch(() => {});
  }, []);

  async function handleEmailSave(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token || !email) return;

    setEmailStatus("saving");
    setEmailError("");

    try {
      // Use API key auth — need to use the session token via the session endpoint
      // For now, use the JWT token as bearer
      const res = await fetch(`${API_URL}/accounts/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "Failed to update email");
      }

      setEmailStatus("saved");
      setTimeout(() => setEmailStatus("idle"), 2000);
    } catch (err: any) {
      setEmailStatus("error");
      setEmailError(err.message);
    }
  }

  if (!account) {
    return (
      <p className="font-mono text-sm text-muted-foreground">loading...</p>
    );
  }

  return (
    <div>
      <h1 className="mb-6 font-mono text-2xl font-bold">settings</h1>

      <div className="space-y-6">
        {/* Account type */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-3 font-mono text-sm font-bold">account type</h2>
          <span
            className={`rounded-md px-3 py-1 font-mono text-sm font-medium ${
              account.type === "consumer"
                ? "bg-blue-500/10 text-blue-400"
                : "bg-emerald-500/10 text-emerald-400"
            }`}
          >
            {account.type}
          </span>
        </div>

        {/* Wallet */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-3 font-mono text-sm font-bold">wallet address</h2>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-background px-3 py-2 font-mono text-xs text-muted-foreground">
              {account.walletAddress}
            </code>
            <Button
              variant="outline"
              size="sm"
              className="border-border text-xs"
              onClick={() => navigator.clipboard.writeText(account.walletAddress)}
            >
              copy
            </Button>
          </div>
        </div>

        {/* API Key */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-3 font-mono text-sm font-bold">API key</h2>
          <p className="mb-3 text-xs text-muted-foreground">
            Your API key was shown once at account creation. If you lost it, use
            wallet signature recovery via{" "}
            <code className="text-emerald-500">/auth/challenge</code> +{" "}
            <code className="text-emerald-500">/auth/verify</code> to generate a
            new one.
          </p>
          <a
            href="/api-docs"
            className="text-xs text-emerald-500 underline underline-offset-4 hover:text-emerald-400"
          >
            see API docs for key recovery
          </a>
        </div>

        {/* Email */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-3 font-mono text-sm font-bold">email</h2>
          <p className="mb-3 text-xs text-muted-foreground">
            Link an email to enable email-based login.
          </p>
          <form onSubmit={handleEmailSave} className="flex gap-2">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={emailStatus === "saving"}
              className="bg-emerald-600 text-white hover:bg-emerald-500"
            >
              {emailStatus === "saving"
                ? "saving..."
                : emailStatus === "saved"
                  ? "saved!"
                  : "save"}
            </Button>
          </form>
          {emailError && (
            <p className="mt-2 text-xs text-red-400">{emailError}</p>
          )}
        </div>

        {/* Account ID */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-3 font-mono text-sm font-bold">account ID</h2>
          <code className="rounded-lg bg-background px-3 py-2 font-mono text-xs text-muted-foreground">
            {account.id}
          </code>
        </div>
      </div>
    </div>
  );
}
