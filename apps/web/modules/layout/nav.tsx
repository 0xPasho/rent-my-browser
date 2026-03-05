"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border bg-background/80 backdrop-blur-md"
          : "bg-transparent",
      )}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="/" className="font-mono text-lg font-bold tracking-tight">
          🌐 rent my browser 🦞
        </a>

        <div className="hidden items-center gap-8 md:flex">
          <a
            href="/#how-it-works"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            How it works
          </a>
          <a
            href="/#pricing"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Pricing
          </a>
          <a
            href="/#operators"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Earn
          </a>
        </div>

        <Button
          asChild
          size="sm"
          className="bg-emerald-600 text-white hover:bg-emerald-500"
        >
          <a href="/login">Get Started</a>
        </Button>
      </nav>
    </header>
  );
}
