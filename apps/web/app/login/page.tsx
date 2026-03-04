"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useSignMessage } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Nav } from "@/modules/layout/nav";
import { Footer } from "@/modules/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

type Tab = "wallet" | "email";

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("wallet");

  return (
    <>
      <Nav />
      <main className="px-6 pb-20 pt-32">
        <div className="mx-auto max-w-md">
          <h1 className="mb-2 text-center font-mono text-3xl font-bold tracking-tight">
            sign in
          </h1>
          <p className="mb-8 text-center text-sm text-muted-foreground">
            access your dashboard, view balance, and manage tasks.
          </p>

          {/* Tabs */}
          <div className="mb-6 flex rounded-lg border border-border bg-card p-1">
            <button
              onClick={() => setTab("wallet")}
              className={`flex-1 rounded-md py-2 font-mono text-sm font-medium transition-colors ${
                tab === "wallet"
                  ? "bg-emerald-600 text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              wallet
            </button>
            <button
              onClick={() => setTab("email")}
              className={`flex-1 rounded-md py-2 font-mono text-sm font-medium transition-colors ${
                tab === "email"
                  ? "bg-emerald-600 text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              email
            </button>
          </div>

          {tab === "wallet" ? <WalletLogin /> : <EmailLogin />}
        </div>
      </main>
      <Footer />
    </>
  );
}

function WalletLogin() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [status, setStatus] = useState<"idle" | "signing" | "verifying" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSign() {
    if (!address) return;
    setStatus("signing");
    setError("");

    try {
      // 1. Get challenge
      const { message } = await api<{ message: string }>("/auth/challenge", {
        method: "POST",
        body: JSON.stringify({ wallet_address: address }),
      });

      // 2. Sign with wallet
      const signature = await signMessageAsync({ message });

      // 3. Verify
      setStatus("verifying");
      const result = await api<{
        account_id: string;
        api_key: string;
        dashboard_url: string;
      }>("/auth/verify", {
        method: "POST",
        body: JSON.stringify({ wallet_address: address, signature }),
      });

      // 4. Extract JWT from dashboard_url and set cookie
      const url = new URL(result.dashboard_url);
      const token = url.searchParams.get("token");
      if (token) {
        document.cookie = `rmb_session=${token}; path=/; max-age=${60 * 60 * 24}; samesite=lax; secure`;
      }

      router.push("/dashboard");
    } catch (err: any) {
      setStatus("error");
      setError(err.message ?? "Authentication failed");
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-6">
        {!isConnected ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Connect your wallet to sign in or create an account.
            </p>
            <ConnectButton />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Connected as{" "}
              <code className="font-mono text-xs text-emerald-500">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </code>
            </p>
            <Button
              onClick={handleSign}
              disabled={status === "signing" || status === "verifying"}
              className="w-full bg-emerald-600 text-white hover:bg-emerald-500"
            >
              {status === "signing"
                ? "sign the message in your wallet..."
                : status === "verifying"
                  ? "verifying..."
                  : "sign in with wallet"}
            </Button>
          </div>
        )}
      </div>

      {error && (
        <p className="text-center text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}

function EmailLogin() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("sending");
    setError("");

    try {
      await fetch(`${API_URL}/auth/email/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus("sent");
    } catch (err: any) {
      setStatus("error");
      setError(err.message ?? "Failed to send magic link");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <div className="mb-3 text-3xl">&#9993;</div>
        <h3 className="mb-2 font-mono text-base font-semibold">
          check your email
        </h3>
        <p className="text-sm text-muted-foreground">
          We sent a magic link to{" "}
          <strong className="text-foreground">{email}</strong>. Click it to sign
          in.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm text-emerald-500 underline underline-offset-4 hover:text-emerald-400"
        >
          try a different email
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSend}
        className="rounded-xl border border-border bg-card p-6"
      >
        <p className="mb-4 text-sm text-muted-foreground">
          Enter your email to receive a magic link. No password needed.
        </p>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={status === "sending"}
            className="bg-emerald-600 text-white hover:bg-emerald-500"
          >
            {status === "sending" ? "sending..." : "send link"}
          </Button>
        </div>
      </form>

      {error && (
        <p className="text-center text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
