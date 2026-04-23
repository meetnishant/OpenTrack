"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import "maplibre-gl/dist/maplibre-gl.css";

interface Vehicle {
  id: string;
  currentLngLat: [number, number];
  targetLngLat: [number, number];
  bearing: number;
  speed: number;
  passengers: number;
}

interface MapComponentProps {
  routeData?: any;
  historyData?: any;
  vehicles: { [key: string]: Vehicle };
  selectedVehicleId?: string | null;
}

export default function MapComponent({ routeData, historyData, vehicles, selectedVehicleId }: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const animationFrame = useRef<number>();
  const vehiclesRef = useRef<{ [key: string]: Vehicle }>(vehicles);

  // Keep ref in sync
  useEffect(() => {
    vehiclesRef.current = vehicles;
  }, [vehicles]);

  // Handle History Loading
  useEffect(() => {
    if (map.current && historyData) {
      const source = map.current.getSource("history") as maplibregl.GeoJSONSource;
      if (source) {
        source.setData(historyData.path);
        
        // Fit bounds to the historical path
        const coordinates = historyData.path.geometry.coordinates;
        if (coordinates.length > 0) {
          const bounds = coordinates.reduce((acc: any, coord: any) => acc.extend(coord), new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));
          map.current.fitBounds(bounds, { padding: 100, duration: 2000 });
        }
      }
    } else if (map.current && !historyData) {
      const source = map.current.getSource("history") as maplibregl.GeoJSONSource;
      if (source) source.setData({ type: "FeatureCollection", features: [] });
    }
  }, [historyData]);

  // Center on selected
  useEffect(() => {
    if (map.current && selectedVehicleId && vehicles[selectedVehicleId]) {
      const v = vehicles[selectedVehicleId];
      map.current.flyTo({ center: v.currentLngLat, zoom: 17, essential: true, duration: 1000 });
    }
  }, [selectedVehicleId]);

  // Animation Loop for LIVE vehicles
  const animate = () => {
    if (!map.current) return;
    const features = Object.values(vehiclesRef.current).map((v) => ({
      type: "Feature",
      properties: { id: v.id, bearing: v.bearing, speed: v.speed, passengers: v.passengers },
      geometry: { type: "Point", coordinates: v.currentLngLat }
    }));
    const source = map.current.getSource("vehicles") as maplibregl.GeoJSONSource;
    if (source) source.setData({ type: "FeatureCollection", features });
    animationFrame.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
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
            carto: { type: "raster", tiles: ["https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png"], tileSize: 256 },
            protomaps: { type: "vector", url: `pmtiles://${window.location.origin}/monaco.pmtiles` },
            vehicles: { type: "geojson", data: { type: "FeatureCollection", features: [] } },
            route: { type: "geojson", data: { type: "FeatureCollection", features: [] } },
            history: { type: "geojson", data: { type: "FeatureCollection", features: [] } }
          },
          layers: [
            { id: "global-base", type: "raster", source: "carto" },
            { id: "water", type: "fill", source: "protomaps", "source-layer": "water", paint: { "fill-color": "#1e1b4b" } },
            { id: "buildings", type: "fill", source: "protomaps", "source-layer": "buildings", paint: { "fill-color": "#312e81", "fill-opacity": 0.5 } },
            { id: "roads", type: "line", source: "protomaps", "source-layer": "roads", paint: { "line-color": "#4338ca", "line-width": 1 } },
            
            // Paths
            { id: "history-path", type: "line", source: "history", layout: { "line-join": "round", "line-cap": "round" }, paint: { "line-color": "#22d3ee", "line-width": 4, "line-opacity": 0.6, "line-dasharray": [2, 2] } },
            { id: "route-line", type: "line", source: "route", layout: { "line-join": "round", "line-cap": "round" }, paint: { "line-color": "#6366f1", "line-width": 6, "line-opacity": 0.8 } },
            
            // Live Markers
            { id: "vehicle-marker", type: "symbol", source: "vehicles", layout: { "icon-image": "triangle", "icon-size": 0.8, "icon-rotate": ["get", "bearing"], "icon-rotation-alignment": "map", "icon-allow-overlap": true, "text-field": ["get", "id"], "text-font": ["Open Sans Regular"], "text-size": 11, "text-offset": [0, 1.8], "text-anchor": "top" }, paint: { "icon-color": "#facc15", "text-color": "#fff", "text-halo-color": "#000", "text-halo-width": 1.5 } },
            { id: "vehicle-dot", type: "circle", source: "vehicles", paint: { "circle-radius": 5, "circle-color": "#facc15", "circle-stroke-width": 2, "circle-stroke-color": "#000" } }
          ],
          center: [81.8463, 25.4358],
          zoom: 12
        }
      });

      map.current.on("load", () => {
        const canvas = document.createElement('canvas');
        canvas.width = 32; canvas.height = 32;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(32, 32); ctx.lineTo(16, 26); ctx.lineTo(0, 32); ctx.closePath(); ctx.fill();
          map.current?.addImage('triangle', ctx.getImageData(0, 0, 32, 32));
        }
        animate();
      });

      return () => {
        cancelAnimationFrame(animationFrame.current!);
        map.current?.remove();
        map.current = null;
      };
    } catch (err) { console.error(err); }
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[2.5rem] border border-white/5 bg-black shadow-2xl">
      <div ref={mapContainer} className="h-full w-full" />
    </div>
  );
}
