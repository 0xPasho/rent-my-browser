"use client";

import { useNetworkStats } from "./use-network-stats";

export function LiveCounter() {
  const stats = useNetworkStats();

  return (
    <div className="mb-8 flex items-center justify-center gap-3">
      <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
      <span className="font-mono text-sm tracking-wide text-muted-foreground">
        <span className="font-bold text-foreground">{stats.totalNodes}</span>{" "}
        real browsers across{" "}
        <span className="font-bold text-foreground">
          {stats.countries.length}
        </span>{" "}
        countries
      </span>
    </div>
  );
}
