"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import { io } from "socket.io-client";
import "maplibre-gl/dist/maplibre-gl.css";

interface MapComponentProps {
  routeData?: any;
}

export default function MapComponent({ routeData }: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const vehicles = useRef<{ [key: string]: any }>({});
  const [fleetCount, setFleetCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Sync route data to map
  useEffect(() => {
    if (map.current && routeData) {
      const source = map.current.getSource("route") as maplibregl.GeoJSONSource;
      if (source) {
        source.setData({
          type: "Feature",
          geometry: routeData,
          properties: {}
        });

        // Auto-fit bounds
        const coordinates = routeData.coordinates;
        const bounds = coordinates.reduce((acc: any, coord: any) => {
          return acc.extend(coord);
        }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));

        map.current.fitBounds(bounds, { padding: 80, duration: 1000 });
      }
    } else if (map.current && !routeData) {
      const source = map.current.getSource("route") as maplibregl.GeoJSONSource;
      if (source) {
        source.setData({ type: "FeatureCollection", features: [] });
      }
    }
  }, [routeData]);

  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return;

    try {
      console.log("MapComponent: Initializing...");

      // @ts-ignore
      if (!window._pmtilesRegistered) {
        const protocol = new Protocol();
        maplibregl.addProtocol("pmtiles", protocol.tile);
        // @ts-ignore
        window._pmtilesRegistered = true;
      }

      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            protomaps: {
              type: "vector",
              url: `pmtiles://${window.location.origin}/monaco.pmtiles`,
              attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>'
            },
            vehicles: {
              type: "geojson",
              data: { type: "FeatureCollection", features: [] }
            },
            route: {
              type: "geojson",
              data: { type: "FeatureCollection", features: [] }
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
              paint: { "line-color": "#222", "line-width": 1 }
            },
            {
              id: "route-line",
              type: "line",
              source: "route",
              layout: { "line-join": "round", "line-cap": "round" },
              paint: {
                "line-color": "#6366f1",
                "line-width": 5,
                "line-opacity": 0.8
              }
            },
            {
              id: "vehicle-layer",
              type: "circle",
              source: "vehicles",
              paint: {
                "circle-radius": 6,
                "circle-color": "#facc15",
                "circle-stroke-width": 2,
                "circle-stroke-color": "#000"
              }
            }
          ],
          center: [11.254, 43.767],
          zoom: 13
        }
      });

      map.current.on("error", (e) => {
        console.error("MapLibre Error:", e);
        setError(`Map Error: ${e.error?.message || "Unknown error"}`);
      });

      const socket = io("http://localhost:3001");

      socket.on("v_upd", (data) => {
        vehicles.current[data.id] = {
          type: "Feature",
          properties: { id: data.id, speed: data.speed, passengers: data.passengers },
          geometry: { type: "Point", coordinates: [data.lng, data.lat] }
        };

        setFleetCount(Object.keys(vehicles.current).length);

        if (map.current) {
          const source = map.current.getSource("vehicles") as maplibregl.GeoJSONSource;
          if (source) {
            source.setData({
              type: "FeatureCollection",
              features: Object.values(vehicles.current)
            });
          }
        }
      });

      return () => {
        socket.disconnect();
        map.current?.remove();
        map.current = null;
      };
    } catch (err: any) {
      console.error("Initialization failed:", err);
      setError(err.message);
    }
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl">
      <div ref={mapContainer} className="h-full w-full" />
      
      <div className="absolute top-4 left-4 z-10 rounded-xl bg-black/60 border border-white/10 p-4 backdrop-blur-xl">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 font-inter">Live Network</h3>
        <div className="flex items-center gap-2">
           <span className="relative flex h-2 w-2">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
           </span>
           <span className="text-sm font-semibold font-outfit text-white">Active Fleet: {fleetCount}</span>
        </div>
      </div>

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-20 p-8 text-center">
          <div className="max-w-md">
            <p className="text-red-400 font-bold mb-2 uppercase text-xs tracking-widest">Initialization Error</p>
            <p className="text-white/60 text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
