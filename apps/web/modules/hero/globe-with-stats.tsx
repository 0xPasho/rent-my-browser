"use client";

import { Globe } from "./globe";
import { useNetworkStats } from "./use-network-stats";

export function GlobeWithStats() {
  const stats = useNetworkStats();
  return <Globe countries={stats.countries} locations={stats.locations} />;
}
