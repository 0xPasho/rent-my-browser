"use client";

import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export interface NodeLocation {
  lng: number;
  lat: number;
  city: string;
  nodes: number;
}

export interface NetworkStats {
  totalNodes: number;
  countries: string[];
  locations: NodeLocation[];
}

export function useNetworkStats(): NetworkStats {
  const [stats, setStats] = useState<NetworkStats>({
    totalNodes: 0,
    countries: [],
    locations: [],
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      try {
        const res = await fetch(`${API_URL}/stats`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setStats({
          totalNodes: data.online_nodes ?? 0,
          countries: data.countries ?? [],
          locations: data.locations ?? [],
        });
      } catch {
        // Silently fail
      }
    }

    fetchStats();
    const interval = setInterval(fetchStats, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return stats;
}
