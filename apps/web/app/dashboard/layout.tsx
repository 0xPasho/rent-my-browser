"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

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

const navItems = [
  { href: "/dashboard", label: "overview" },
  { href: "/dashboard/tasks", label: "tasks" },
  { href: "/dashboard/top-up", label: "top up" },
  { href: "/dashboard/settings", label: "settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((c) => c.startsWith("rmb_session="))
      ?.split("=")[1];

    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${API_URL}/auth/session`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Session expired");
        return res.json();
      })
      .then((data) => {
        setAccount(data);
        setLoading(false);
      })
      .catch(() => {
        document.cookie = "rmb_session=; path=/; max-age=0";
        router.push("/login");
      });
  }, [router]);

  function handleLogout() {
    document.cookie = "rmb_session=; path=/; max-age=0";
    router.push("/");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="font-mono text-sm text-muted-foreground">loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-mono text-lg font-bold">
              🌐 rent my browser 🦞
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-1.5 font-mono text-sm transition-colors ${
                    pathname === item.href
                      ? "bg-emerald-600/10 text-emerald-500"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-mono text-sm font-bold">
                {account?.balance.toLocaleString()}{" "}
                <span className="text-muted-foreground">credits</span>
              </p>
              <p className="font-mono text-[10px] text-muted-foreground">
                ${((account?.balance ?? 0) / 100).toFixed(2)} USD
              </p>
            </div>
            <span
              className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-medium ${
                account?.type === "consumer"
                  ? "bg-blue-500/10 text-blue-400"
                  : "bg-emerald-500/10 text-emerald-400"
              }`}
            >
              {account?.type}
            </span>
            <button
              onClick={handleLogout}
              className="font-mono text-xs text-muted-foreground hover:text-foreground"
            >
              logout
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="flex gap-1 overflow-x-auto border-t border-border/50 px-6 py-2 md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 font-mono text-xs ${
                pathname === item.href
                  ? "bg-emerald-600/10 text-emerald-500"
                  : "text-muted-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
