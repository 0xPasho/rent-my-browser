"use client";

import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

// Fake base data (shown immediately, real data adds on top)
const BASE_NODES = 147;
const BASE_COUNTRIES = [
  "US", "DE", "BR", "JP", "AU", "IN", "FR", "GB", "KR", "SG", "CA",
];
const BASE_LOCATIONS = [
  { lng: -122.42, lat: 37.77, city: "San Francisco", nodes: 23 },
  { lng: -73.94, lat: 40.73, city: "New York", nodes: 31 },
  { lng: -43.17, lat: -22.91, city: "Sao Paulo", nodes: 8 },
  { lng: 13.41, lat: 52.52, city: "Berlin", nodes: 18 },
  { lng: 2.35, lat: 48.86, city: "Paris", nodes: 12 },
  { lng: -0.12, lat: 51.51, city: "London", nodes: 21 },
  { lng: 139.69, lat: 35.69, city: "Tokyo", nodes: 11 },
  { lng: 126.98, lat: 37.57, city: "Seoul", nodes: 7 },
  { lng: 103.82, lat: 1.35, city: "Singapore", nodes: 5 },
  { lng: 77.21, lat: 28.61, city: "New Delhi", nodes: 4 },
  { lng: 151.21, lat: -33.87, city: "Sydney", nodes: 3 },
  { lng: -79.38, lat: 43.65, city: "Toronto", nodes: 4 },
];

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
  const [liveNodes, setLiveNodes] = useState(0);
  const [liveCountries, setLiveCountries] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      try {
        const res = await fetch(`${API_URL}/stats`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setLiveNodes(data.online_nodes ?? 0);
        setLiveCountries(data.countries ?? []);
      } catch {
        // Silently fail — we still show base data
      }
    }

    fetchStats();

    // Refresh every 60s to stay in sync with server cache
    const interval = setInterval(fetchStats, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Merge: base countries + any new real countries
  const mergedCountries = Array.from(
    new Set([...BASE_COUNTRIES, ...liveCountries]),
  );

  return {
    totalNodes: BASE_NODES + liveNodes,
    countries: mergedCountries,
    locations: BASE_LOCATIONS,
  };
}
