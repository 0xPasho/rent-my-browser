"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { NodeLocation } from "./use-network-stats";

const ROTATION_SPEED = 0.015;
const RESUME_DELAY = 3000; // resume auto-rotate 3s after user stops dragging

interface GlobeProps {
  countries?: string[];
  locations?: NodeLocation[];
}

export function Globe({ countries = [], locations = [] }: GlobeProps = {}) {
  const nodeCountries = countries;
  const nodeLocations = locations;
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const frameRef = useRef<number>(0);
  const userInteracting = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || !containerRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      projection: "globe",
      center: [20, 30],
      zoom: 1.3,
      interactive: true,
      dragRotate: true,
      scrollZoom: false,
      doubleClickZoom: false,
      touchZoomRotate: false,
      keyboard: false,
      attributionControl: false,
      fadeDuration: 0,
    });

    mapRef.current = map;

    map.on("style.load", () => {
      // Atmosphere / space effect
      map.setFog({
        color: "rgb(10, 10, 10)",
        "high-color": "rgb(20, 20, 30)",
        "horizon-blend": 0.08,
        "space-color": "rgb(10, 10, 10)",
        "star-intensity": 0.4,
      });

      // Highlight countries with nodes
      map.addSource("country-boundaries", {
        type: "vector",
        url: "mapbox://mapbox.country-boundaries-v1",
      });

      map.addLayer(
        {
          id: "node-countries-fill",
          type: "fill",
          source: "country-boundaries",
          "source-layer": "country_boundaries",
          filter: [
            "in",
            ["get", "iso_3166_1"],
            ["literal", nodeCountries],
          ],
          paint: {
            "fill-color": "#10b981",
            "fill-opacity": 0.15,
          },
        },
        "country-label"
      );

      map.addLayer(
        {
          id: "node-countries-line",
          type: "line",
          source: "country-boundaries",
          "source-layer": "country_boundaries",
          filter: [
            "in",
            ["get", "iso_3166_1"],
            ["literal", nodeCountries],
          ],
          paint: {
            "line-color": "#10b981",
            "line-opacity": 0.4,
            "line-width": 0.8,
          },
        },
        "country-label"
      );

      // Node location dots (GeoJSON source)
      map.addSource("node-locations", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: nodeLocations.map((loc) => ({
            type: "Feature" as const,
            geometry: {
              type: "Point" as const,
              coordinates: [loc.lng, loc.lat],
            },
            properties: {
              city: loc.city,
              nodes: loc.nodes,
            },
          })),
        },
      });

      // Outer glow ring (larger, faded)
      map.addLayer({
        id: "node-dots-glow",
        type: "circle",
        source: "node-locations",
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["get", "nodes"],
            3, 6,
            31, 14,
          ],
          "circle-color": "#10b981",
          "circle-opacity": 0.15,
          "circle-blur": 1,
        },
      });

      // Inner dot
      map.addLayer({
        id: "node-dots",
        type: "circle",
        source: "node-locations",
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["get", "nodes"],
            3, 2.5,
            31, 5,
          ],
          "circle-color": "#10b981",
          "circle-opacity": 0.9,
        },
      });
    });

    // Auto-rotate (pauses when user drags, resumes after)
    let lng = 20;
    const rotate = () => {
      if (!userInteracting.current) {
        lng += ROTATION_SPEED;
        if (lng > 180) lng -= 360;
        map.setCenter([lng, 30]);
      }
      frameRef.current = requestAnimationFrame(rotate);
    };

    // Pause auto-rotation on user interaction
    const onInteractionStart = () => {
      userInteracting.current = true;
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };

    // Resume auto-rotation after user stops
    const onInteractionEnd = () => {
      resumeTimer.current = setTimeout(() => {
        // Sync lng to current map center so rotation continues smoothly
        const center = map.getCenter();
        lng = center.lng;
        userInteracting.current = false;
      }, RESUME_DELAY);
    };

    map.on("mousedown", onInteractionStart);
    map.on("touchstart", onInteractionStart);
    map.on("mouseup", onInteractionEnd);
    map.on("touchend", onInteractionEnd);
    map.on("dragend", onInteractionEnd);

    map.on("load", () => {
      frameRef.current = requestAnimationFrame(rotate);
    });

    return () => {
      cancelAnimationFrame(frameRef.current);
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
      <div ref={containerRef} className="h-full w-full" />
      <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_60px_30px_rgba(10,10,10,0.8)]" />
    </div>
  );
}
