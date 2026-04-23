"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import { io } from "socket.io-client";
import "maplibre-gl/dist/maplibre-gl.css";

interface MapComponentProps {
  routeData?: any;
}

interface VehicleState {
  id: string;
  currentLngLat: [number, number];
  targetLngLat: [number, number];
  bearing: number;
  speed: number;
  passengers: number;
}

export default function MapComponent({ routeData }: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const vehiclesState = useRef<{ [key: string]: VehicleState }>({});
  const animationFrame = useRef<number>();
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

  // Animation Loop
  const animate = () => {
    const features: any[] = [];
    const lerpFactor = 0.05; // Smoothing factor (Adjust for speed)

    Object.values(vehiclesState.current).forEach((v) => {
      // Linear Interpolation (Lerp)
      v.currentLngLat[0] += (v.targetLngLat[0] - v.currentLngLat[0]) * lerpFactor;
      v.currentLngLat[1] += (v.targetLngLat[1] - v.currentLngLat[1]) * lerpFactor;

      features.push({
        type: "Feature",
        properties: { 
          id: v.id, 
          bearing: v.bearing,
          speed: v.speed,
          passengers: v.passengers 
        },
        geometry: { type: "Point", coordinates: v.currentLngLat }
      });
    });

    if (map.current) {
      const source = map.current.getSource("vehicles") as maplibregl.GeoJSONSource;
      if (source) {
        source.setData({ type: "FeatureCollection", features });
      }
    }

    animationFrame.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return;

    try {
      console.log("MapComponent: Initializing 60FPS Interpolation Engine...");

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
            carto: {
              type: "raster",
              tiles: ["https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png"],
              tileSize: 256,
              attribution: '© CARTO'
            },
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
              source: "carto"
            },
            {
              id: "route-line",
              type: "line",
              source: "route",
              layout: { "line-join": "round", "line-cap": "round" },
              paint: {
                "line-color": "#6366f1",
                "line-width": 6,
                "line-opacity": 0.8
              }
            },
            {
              id: "vehicle-marker",
              type: "symbol",
              source: "vehicles",
              layout: {
                "icon-image": "triangle",
                "icon-size": 1,
                "icon-rotate": ["get", "bearing"],
                "icon-rotation-alignment": "map",
                "icon-allow-overlap": true,
                "text-field": ["get", "id"],
                "text-font": ["Open Sans Regular"],
                "text-size": 10,
                "text-offset": [0, 1.5],
                "text-anchor": "top"
              },
              paint: {
                "icon-color": "#facc15",
                "text-color": "#fff",
                "text-halo-color": "#000",
                "text-halo-width": 1
              }
            },
            {
              id: "vehicle-dot",
              type: "circle",
              source: "vehicles",
              paint: {
                "circle-radius": 4,
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

      // Load icons
      map.current.on("load", () => {
        // Create a simple triangle icon for heading
        const canvas = document.createElement('canvas');
        canvas.width = 24;
        canvas.height = 24;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.moveTo(12, 0);
          ctx.lineTo(24, 24);
          ctx.lineTo(0, 24);
          ctx.closePath();
          ctx.fill();
        }
        
        map.current?.addImage('triangle', ctx!.getImageData(0, 0, 24, 24));
        animate(); // Start animation loop
      });

      const socket = io("http://localhost:3001");
      socket.on("v_upd", (data) => {
        const prev = vehiclesState.current[data.id];
        
        // Calculate bearing if we have a previous position
        let bearing = 0;
        if (prev) {
          const dy = data.lat - prev.currentLngLat[1];
          const dx = data.lng - prev.currentLngLat[0];
          bearing = (Math.atan2(dx, dy) * 180) / Math.PI;
        }

        vehiclesState.current[data.id] = {
          id: data.id,
          currentLngLat: prev ? prev.currentLngLat : [data.lng, data.lat],
          targetLngLat: [data.lng, data.lat],
          bearing: bearing,
          speed: data.speed,
          passengers: data.passengers
        };

        setFleetCount(Object.keys(vehiclesState.current).length);
      });

      return () => {
        socket.disconnect();
        cancelAnimationFrame(animationFrame.current!);
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
        </div>
      </div>

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-md z-20 p-8 text-center">
          <p className="text-white/60 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
