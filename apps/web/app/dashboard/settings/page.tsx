"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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

export default function SettingsPage() {
  const [account, setAccount] = useState<Account | null>(null);

  // API key state
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [apiKeyLoading, setApiKeyLoading] = useState(false);
  const [apiKeyError, setApiKeyError] = useState("");

  // Wallet state
  const [walletStatus, setWalletStatus] = useState<"idle" | "connecting" | "signing" | "saving" | "error">("idle");
  const [walletError, setWalletError] = useState("");

  // Email state
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailStatus, setEmailStatus] = useState<
    "idle" | "sending-otp" | "otp-sent" | "saving" | "saved" | "error"
  >("idle");
  const [emailError, setEmailError] = useState("");

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

  // Fetch API key on first reveal
  async function handleToggleApiKey() {
    if (apiKeyVisible) {
      setApiKeyVisible(false);
      return;
    }

    if (apiKey) {
      setApiKeyVisible(true);
      return;
    }

    const token = getToken();
    if (!token) return;

    setApiKeyLoading(true);
    setApiKeyError("");
    try {
      const res = await fetch(`${API_URL}/auth/api-key`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "Failed to retrieve API key");
      }
      const data = await res.json();
      setApiKey(data.api_key);
      setApiKeyVisible(true);
      toast.success("API key revealed");
    } catch (err: any) {
      setApiKeyError(err.message);
      toast.error(err.message);
    } finally {
      setApiKeyLoading(false);
    }
  }

  // Send OTP to current email
  async function handleSendOtp() {
    const token = getToken();
    if (!token) return;

    setEmailStatus("sending-otp");
    setEmailError("");
    try {
      const res = await fetch(`${API_URL}/accounts/me/email/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "Failed to send OTP");
      }
      setOtpSent(true);
      setEmailStatus("otp-sent");
      toast.success("Verification code sent to your email");
    } catch (err: any) {
      setEmailStatus("error");
      setEmailError(err.message);
      toast.error(err.message);
    }
  }

  // Save email (with OTP if needed)
  async function handleEmailSave(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token || !email) return;

    setEmailStatus("saving");
    setEmailError("");

    try {
      const body: { email: string; otp?: string } = { email };
      if (otp) body.otp = otp;

      const res = await fetch(`${API_URL}/accounts/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "Failed to update email");
      }

      setAccount((prev) => (prev ? { ...prev, email } : prev));
      setOtpSent(false);
      setOtp("");
      setEmailStatus("saved");
      toast.success("Email updated");
      setTimeout(() => setEmailStatus("idle"), 2000);
    } catch (err: any) {
      setEmailStatus("error");
      setEmailError(err.message);
      toast.error(err.message);
    }
  }

  // Link wallet via MetaMask / injected provider
  async function handleLinkWallet() {
    const token = getToken();
    if (!token || !account) return;

    setWalletStatus("connecting");
    setWalletError("");

    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum) {
        throw new Error("No wallet found. Install MetaMask or another Web3 wallet.");
      }

      const accs: string[] = await ethereum.request({ method: "eth_requestAccounts" });
      const walletAddress = accs[0];
      if (!walletAddress) throw new Error("No account selected");

      setWalletStatus("signing");

      const message = `Link wallet to rent my browser: ${account.id}`;
      const signature = await ethereum.request({
        method: "personal_sign",
        params: [message, walletAddress],
      });

      setWalletStatus("saving");

      const res = await fetch(`${API_URL}/accounts/me/wallet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ wallet_address: walletAddress, signature }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "Failed to link wallet");
      }

      setAccount((prev) => (prev ? { ...prev, walletAddress } : prev));
      setWalletStatus("idle");
      toast.success("Wallet linked");
    } catch (err: any) {
      setWalletStatus("error");
      setWalletError(err.message ?? "Failed to link wallet");
      toast.error(err.message ?? "Failed to link wallet");
    }
  }

  if (!account) {
    return (
      <p className="font-mono text-sm text-muted-foreground">loading...</p>
    );
  }

  const hasEmail = !!account.email;
  const maskedKey = apiKey
    ? apiKey.slice(0, 6) + "•".repeat(32) + apiKey.slice(-4)
    : "••••••••••••••••••••••••••••••••••••••••";

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
          {account.walletAddress ? (
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg bg-background px-3 py-2 font-mono text-xs text-muted-foreground">
                {account.walletAddress}
              </code>
              <Button
                variant="outline"
                size="sm"
                className="border-border text-xs"
                onClick={() => {
                  navigator.clipboard.writeText(account.walletAddress!);
                  toast.success("Wallet address copied");
                }}
              >
                copy
              </Button>
            </div>
          ) : (
            <div>
              <p className="mb-3 text-xs text-muted-foreground">
                Link a wallet to enable crypto payments (x402) and wallet-based login.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="border-border text-xs"
                disabled={walletStatus !== "idle" && walletStatus !== "error"}
                onClick={handleLinkWallet}
              >
                {walletStatus === "connecting"
                  ? "connecting..."
                  : walletStatus === "signing"
                    ? "sign message in wallet..."
                    : walletStatus === "saving"
                      ? "saving..."
                      : "link wallet"}
              </Button>
              {walletError && (
                <p className="mt-2 text-xs text-red-400">{walletError}</p>
              )}
            </div>
          )}
        </div>

        {/* API Key */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-3 font-mono text-sm font-bold">API key</h2>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-background px-3 py-2 font-mono text-xs text-muted-foreground">
              {apiKeyVisible && apiKey ? apiKey : maskedKey}
            </code>
            <Button
              variant="outline"
              size="sm"
              className="border-border text-xs"
              disabled={apiKeyLoading}
              onClick={handleToggleApiKey}
            >
              {apiKeyLoading ? "..." : apiKeyVisible ? "hide" : "show"}
            </Button>
            {apiKeyVisible && apiKey && (
              <Button
                variant="outline"
                size="sm"
                className="border-border text-xs"
                onClick={() => {
                  navigator.clipboard.writeText(apiKey);
                  toast.success("API key copied");
                }}
              >
                copy
              </Button>
            )}
          </div>
          {apiKeyError && (
            <p className="mt-2 text-xs text-red-400">{apiKeyError}</p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            If not available, use wallet signature recovery via{" "}
            <code className="text-emerald-500">/auth/challenge</code> +{" "}
            <code className="text-emerald-500">/auth/verify</code> to generate a
            new one.
          </p>
        </div>

        {/* Email */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-3 font-mono text-sm font-bold">email</h2>
          <p className="mb-3 text-xs text-muted-foreground">
            {hasEmail
              ? "To change your email, we'll send a verification code to your current address."
              : "Link an email to enable email-based login."}
          </p>

          {/* If has email and wants to change → need OTP first */}
          {hasEmail && !otpSent && emailStatus !== "saved" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-background px-3 py-2 font-mono text-xs text-muted-foreground">
                  {account.email}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border text-xs"
                  disabled={emailStatus === "sending-otp"}
                  onClick={handleSendOtp}
                >
                  {emailStatus === "sending-otp" ? "sending..." : "change email"}
                </Button>
              </div>
              {emailError && (
                <p className="text-xs text-red-400">{emailError}</p>
              )}
            </div>
          )}

          {/* OTP sent → show code input + new email input */}
          {hasEmail && otpSent && (
            <form onSubmit={handleEmailSave} className="space-y-3">
              <div>
                <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  code sent to {account.email}
                </label>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-32 font-mono tracking-widest"
                />
              </div>
              <div>
                <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  new email
                </label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="new@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={emailStatus === "saving" || otp.length !== 6}
                    className="bg-emerald-600 text-white hover:bg-emerald-500"
                  >
                    {emailStatus === "saving" ? "saving..." : "save"}
                  </Button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                  setEmailStatus("idle");
                  setEmailError("");
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                cancel
              </button>
              {emailError && (
                <p className="text-xs text-red-400">{emailError}</p>
              )}
            </form>
          )}

          {/* No email → direct set */}
          {!hasEmail && (
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
          )}

          {/* Saved confirmation */}
          {emailStatus === "saved" && (
            <p className="mt-2 text-xs text-emerald-500">email updated!</p>
          )}

          {!hasEmail && emailError && (
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
