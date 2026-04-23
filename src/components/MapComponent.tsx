"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import "maplibre-gl/dist/maplibre-gl.css";

export default function MapComponent() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    // Initialize PMTiles Protocol
    const protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          protomaps: {
            type: "vector",
            url: `pmtiles://${window.location.origin}/monaco.pmtiles`,
            attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>'
          }
        },
        layers: [
          {
            id: "background",
            type: "background",
            paint: { "background-color": "#0a0a0a" }
          },
          {
            id: "roads",
            type: "line",
            source: "protomaps",
            "source-layer": "roads",
            paint: {
              "line-color": "#333",
              "line-width": 1
            }
          }
          // Note: In a real app, we'd use a complete style JSON.
          // This is a minimal style for the "Blank Canvas" story.
        ],
        center: [7.4246, 43.7333], // Monaco
        zoom: 13
      }
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 shadow-2xl">
      <div ref={mapContainer} className="h-full w-full" />
      <div className="absolute bottom-4 left-4 z-10 rounded-lg bg-black/50 px-3 py-1 text-xs text-white/50 backdrop-blur-md">
        © OpenStreetMap | Protomaps (Self-hosted)
      </div>
    </div>
  );
}
