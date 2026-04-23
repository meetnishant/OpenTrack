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
      console.log("MapComponent: Initializing with Premium Dark Global Tiles...");

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
            // High-Quality Global Dark Matter Tiles (CartoDB)
            carto: {
              type: "raster",
              tiles: ["https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png"],
              tileSize: 256,
              attribution: '© OpenStreetMap © CARTO'
            },
            // Local PMTiles (Florence/Monaco) - Overlays on top
            protomaps: {
              type: "vector",
              url: `pmtiles://${window.location.origin}/monaco.pmtiles`,
              attribution: '© Protomaps'
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
              id: "global-base",
              type: "raster",
              source: "carto",
              paint: { "raster-opacity": 1 }
            },
            // Local Vector Highlights (when available)
            {
              id: "local-buildings",
              type: "fill",
              source: "protomaps",
              "source-layer": "buildings",
              paint: { 
                "fill-color": "#6366f1", 
                "fill-opacity": 0.1 
              }
            },
            {
              id: "route-line",
              type: "line",
              source: "route",
              layout: { "line-join": "round", "line-cap": "round" },
              paint: {
                "line-color": "#6366f1",
                "line-width": 6,
                "line-opacity": 1,
                "line-blur": 0.5
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
            {
              id: "vehicle-labels",
              type: "symbol",
              source: "vehicles",
              layout: {
                "text-field": ["get", "id"],
                "text-font": ["Open Sans Regular"],
                "text-size": 11,
                "text-offset": [0, 1.8],
                "text-anchor": "top"
              },
              paint: {
                "text-color": "#fff",
                "text-halo-color": "#000",
                "text-halo-width": 1.5
              }
            }
          ],
          center: [11.254, 43.767],
          zoom: 13
        }
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
      setError(err.message);
    }
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[2.5rem] border border-white/5 bg-black shadow-2xl">
      <div ref={mapContainer} className="h-full w-full" />
      
      {/* Floating Insight Panel */}
      <div className="absolute top-6 left-6 z-10 rounded-2xl bg-zinc-950/80 border border-white/10 p-5 backdrop-blur-2xl shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">Live Fleet</h3>
            <div className="flex items-center gap-2">
              <div className="flex h-2 w-2">
                <div className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></div>
                <div className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></div>
              </div>
              <span className="text-lg font-bold font-outfit text-white tracking-tight">{fleetCount} <span className="text-xs text-white/30 font-normal">Active</span></span>
            </div>
          </div>
          <div className="h-10 w-px bg-white/10 mx-2" />
          <div className="flex flex-col">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">Network</h3>
            <span className="text-xs font-semibold text-white/60">Healthy</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-md z-20 p-8 text-center">
          <div className="max-w-md">
            <p className="text-red-400 font-bold mb-2 uppercase text-xs tracking-widest">Initialization Error</p>
            <p className="text-white/60 text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
