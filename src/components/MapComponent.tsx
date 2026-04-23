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

  useEffect(() => {
    if (map.current && routeData) {
      const source = map.current.getSource("route") as maplibregl.GeoJSONSource;
      if (source) {
        source.setData({
          type: "Feature",
          geometry: routeData,
          properties: {}
        });

        const coordinates = routeData.coordinates;
        const bounds = coordinates.reduce((acc: any, coord: any) => {
          return acc.extend(coord);
        }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));

        map.current.fitBounds(bounds, { padding: 120, duration: 1500 });
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
      console.log("MapComponent: Initializing with Global Raster + Local Vector...");

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
          glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
          sources: {
            // Global Raster Fallback (OSM)
            osm: {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors'
            },
            // Local High-Fidelity Vector (PMTiles)
            protomaps: {
              type: "vector",
              url: `pmtiles://${window.location.origin}/monaco.pmtiles`,
              attribution: '© Protomaps © OpenStreetMap'
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
              id: "osm-layer",
              type: "raster",
              source: "osm",
              paint: { "raster-opacity": 0.4, "raster-brightness-max": 0.3 } // Dim for dark mode feel
            },
            {
              id: "background-dim",
              type: "background",
              paint: { "background-color": "#000", "background-opacity": 0.5 }
            },
            // Vector Layers (where available)
            {
              id: "vector-buildings",
              type: "fill",
              source: "protomaps",
              "source-layer": "buildings",
              paint: { "fill-color": "#222", "fill-opacity": 0.8 }
            },
            {
              id: "vector-roads",
              type: "line",
              source: "protomaps",
              "source-layer": "roads",
              paint: { "line-color": "#444", "line-width": 1.5 }
            },
            {
              id: "route-line",
              type: "line",
              source: "route",
              layout: { "line-join": "round", "line-cap": "round" },
              paint: {
                "line-color": "#6366f1",
                "line-width": 6,
                "line-opacity": 0.9,
                "line-blur": 1
              }
            },
            {
              id: "vehicle-layer",
              type: "circle",
              source: "vehicles",
              paint: {
                "circle-radius": 7,
                "circle-color": "#facc15",
                "circle-stroke-width": 2,
                "circle-stroke-color": "#000"
              }
            },
            // Labels (Symbol layers)
            {
              id: "vehicle-labels",
              type: "symbol",
              source: "vehicles",
              layout: {
                "text-field": ["get", "id"],
                "text-font": ["Open Sans Regular"],
                "text-size": 10,
                "text-offset": [0, 1.5],
                "text-anchor": "top"
              },
              paint: {
                "text-color": "#fff",
                "text-halo-color": "#000",
                "text-halo-width": 1
              }
            }
          ],
          center: [11.254, 43.767],
          zoom: 13
        }
      });

      map.current.on("error", (e) => {
        console.error("MapLibre Error:", e);
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
    <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl">
      <div ref={mapContainer} className="h-full w-full" />
      
      <div className="absolute top-4 left-4 z-10 rounded-xl bg-black/80 border border-white/10 p-4 backdrop-blur-2xl">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 font-inter">Live Fleet Intelligence</h3>
        <div className="flex items-center gap-2">
           <span className="relative flex h-2 w-2">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
           </span>
           <span className="text-sm font-semibold font-outfit text-white">Active Units: {fleetCount}</span>
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
