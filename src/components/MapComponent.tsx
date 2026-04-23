"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import { Vehicle } from "@/types/vehicle";
import "maplibre-gl/dist/maplibre-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import * as turf from "@turf/turf";

interface MapComponentProps {
  routeData?: any;
  historyData?: any;
  playbackIndex?: number;
  vehicles: { [key: string]: Vehicle };
  selectedVehicleId?: string | null;
  onGeofenceUpdate?: (geofences: any[]) => void;
}

const DRAW_STYLES = [
  {
    "id": "gl-draw-polygon-fill-inactive",
    "type": "fill",
    "filter": ["all", ["==", "active", "false"], ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
    "paint": { "fill-color": "#4338ca", "fill-outline-color": "#4338ca", "fill-opacity": 0.1 }
  },
  {
    "id": "gl-draw-polygon-fill-active",
    "type": "fill",
    "filter": ["all", ["==", "active", "true"], ["==", "$type", "Polygon"]],
    "paint": { "fill-color": "#6366f1", "fill-outline-color": "#6366f1", "fill-opacity": 0.2 }
  },
  {
    "id": "gl-draw-polygon-midpoint",
    "type": "circle",
    "filter": ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
    "paint": { "circle-radius": 4, "circle-color": "#6366f1" }
  },
  {
    "id": "gl-draw-polygon-stroke-inactive",
    "type": "line",
    "filter": ["all", ["==", "active", "false"], ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
    "layout": { "line-cap": "round", "line-join": "round" },
    "paint": { "line-color": "#4338ca", "line-width": 2 }
  },
  {
    "id": "gl-draw-polygon-stroke-active",
    "type": "line",
    "filter": ["all", ["==", "active", "true"], ["==", "$type", "Polygon"]],
    "layout": { "line-cap": "round", "line-join": "round" },
    "paint": { "line-color": "#6366f1", "line-dasharray": ["literal", [2, 2]], "line-width": 2 }
  },
  {
    "id": "gl-draw-line-inactive",
    "type": "line",
    "filter": ["all", ["==", "active", "false"], ["==", "$type", "LineString"], ["!=", "mode", "static"]],
    "layout": { "line-cap": "round", "line-join": "round" },
    "paint": { "line-color": "#4338ca", "line-width": 2 }
  },
  {
    "id": "gl-draw-line-active",
    "type": "line",
    "filter": ["all", ["==", "active", "true"], ["==", "$type", "LineString"]],
    "layout": { "line-cap": "round", "line-join": "round" },
    "paint": { "line-color": "#6366f1", "line-dasharray": ["literal", [2, 2]], "line-width": 2 }
  },
  {
    "id": "gl-draw-polygon-and-line-vertex-stroke-inactive",
    "type": "circle",
    "filter": ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"], ["!=", "mode", "static"]],
    "paint": { "circle-radius": 5, "circle-color": "#fff" }
  },
  {
    "id": "gl-draw-polygon-and-line-vertex-inactive",
    "type": "circle",
    "filter": ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"], ["!=", "mode", "static"]],
    "paint": { "circle-radius": 3, "circle-color": "#4338ca" }
  },
  {
    "id": "gl-draw-point-point-stroke-inactive",
    "type": "circle",
    "filter": ["all", ["==", "active", "false"], ["==", "$type", "Point"], ["==", "meta", "feature"], ["!=", "mode", "static"]],
    "paint": { "circle-radius": 5, "circle-opacity": 1, "circle-color": "#fff" }
  },
  {
    "id": "gl-draw-point-inactive",
    "type": "circle",
    "filter": ["all", ["==", "active", "false"], ["==", "$type", "Point"], ["==", "meta", "feature"], ["!=", "mode", "static"]],
    "paint": { "circle-radius": 3, "circle-color": "#4338ca" }
  },
  {
    "id": "gl-draw-point-stroke-active",
    "type": "circle",
    "filter": ["all", ["==", "$type", "Point"], ["==", "active", "true"], ["==", "meta", "feature"]],
    "paint": { "circle-radius": 7, "circle-color": "#fff" }
  },
  {
    "id": "gl-draw-point-active",
    "type": "circle",
    "filter": ["all", ["==", "$type", "Point"], ["==", "active", "true"], ["==", "meta", "feature"]],
    "paint": { "circle-radius": 5, "circle-color": "#6366f1" }
  },
  {
    "id": "gl-draw-polygon-fill-static",
    "type": "fill",
    "filter": ["all", ["==", "mode", "static"], ["==", "$type", "Polygon"]],
    "paint": { "fill-color": "#404040", "fill-outline-color": "#404040", "fill-opacity": 0.1 }
  },
  {
    "id": "gl-draw-polygon-stroke-static",
    "type": "line",
    "filter": ["all", ["==", "mode", "static"], ["==", "$type", "Polygon"]],
    "layout": { "line-cap": "round", "line-join": "round" },
    "paint": { "line-color": "#404040", "line-width": 2 }
  },
  {
    "id": "gl-draw-line-static",
    "type": "line",
    "filter": ["all", ["==", "mode", "static"], ["==", "$type", "LineString"]],
    "layout": { "line-cap": "round", "line-join": "round" },
    "paint": { "line-color": "#404040", "line-width": 2 }
  },
  {
    "id": "gl-draw-point-static",
    "type": "circle",
    "filter": ["all", ["==", "mode", "static"], ["==", "$type", "Point"]],
    "paint": { "circle-radius": 5, "circle-color": "#404040" }
  }
];

export default function MapComponent({ 
  routeData, 
  historyData, 
  playbackIndex = 0,
  vehicles, 
  selectedVehicleId,
  onGeofenceUpdate
}: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);
  const animationFrame = useRef<number>(0);
  const vehiclesRef = useRef<{ [key: string]: Vehicle }>(vehicles);

  // Keep ref in sync
  useEffect(() => {
    vehiclesRef.current = vehicles;
  }, [vehicles]);

  // Handle History Loading & Playback Marker
  useEffect(() => {
    if (map.current && historyData) {
      const source = map.current.getSource("history") as maplibregl.GeoJSONSource;
      const markerSource = map.current.getSource("history-marker") as maplibregl.GeoJSONSource;
      
      if (source) {
        source.setData(historyData.path);
        if (markerSource && historyData.path.properties.points[playbackIndex]) {
          const point = historyData.path.properties.points[playbackIndex];
          markerSource.setData({
            type: "Feature",
            geometry: { type: "Point", coordinates: [point.longitude, point.latitude] },
            properties: { id: "PLAYBACK", bearing: point.heading }
          } as any);
        }

        if (playbackIndex === 0) {
          const coordinates = historyData.path.geometry.coordinates;
          if (coordinates.length > 0) {
            const bounds = coordinates.reduce((acc: any, coord: any) => acc.extend(coord), new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));
            map.current.fitBounds(bounds, { padding: 100, duration: 2000 });
          }
        }
      }
    } else if (map.current && !historyData) {
      const source = map.current.getSource("history") as maplibregl.GeoJSONSource;
      const markerSource = map.current.getSource("history-marker") as maplibregl.GeoJSONSource;
      if (source) source.setData({ type: "FeatureCollection", features: [] });
      if (markerSource) markerSource.setData({ type: "FeatureCollection", features: [] });
    }
  }, [historyData, playbackIndex]);

  // Center on selected
  useEffect(() => {
    if (map.current && selectedVehicleId && vehicles[selectedVehicleId]) {
      const v = vehicles[selectedVehicleId];
      map.current.flyTo({ center: v.currentLngLat, zoom: 17, essential: true, duration: 1000 });
    }
  }, [selectedVehicleId, vehicles]);

  // Animation Loop for LIVE vehicles
  const animate = () => {
    if (!map.current) return;
    const features = Object.values(vehiclesRef.current).map((v) => ({
      type: "Feature" as const,
      properties: { id: v.id, bearing: v.bearing, speed: v.speed, passengers: v.passengers },
      geometry: { type: "Point" as const, coordinates: v.currentLngLat }
    }));
    const source = map.current.getSource("vehicles") as maplibregl.GeoJSONSource;
    if (source) {
      source.setData({ type: "FeatureCollection", features: features as any });
    }
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
            history: { type: "geojson", data: { type: "FeatureCollection", features: [] } },
            "history-marker": { type: "geojson", data: { type: "FeatureCollection", features: [] } }
          },
          layers: [
            { id: "global-base", type: "raster", source: "carto" },
            { id: "water", type: "fill", source: "protomaps", "source-layer": "water", paint: { "fill-color": "#1e1b4b" } },
            { id: "buildings", type: "fill", source: "protomaps", "source-layer": "buildings", paint: { "fill-color": "#312e81", "fill-opacity": 0.5 } },
            { id: "roads", type: "line", source: "protomaps", "source-layer": "roads", paint: { "line-color": "#4338ca", "line-width": 1 } },
            { id: "history-path", type: "line", source: "history", layout: { "line-join": "round", "line-cap": "round" }, paint: { "line-color": "#22d3ee", "line-width": 4, "line-opacity": 0.6, "line-dasharray": [2, 2] } },
            { id: "route-line", type: "line", source: "route", layout: { "line-join": "round", "line-cap": "round" }, paint: { "line-color": "#6366f1", "line-width": 6, "line-opacity": 0.8 } },
            { id: "playback-marker", type: "symbol", source: "history-marker", layout: { "icon-image": "triangle-cyan", "icon-size": 1.2, "icon-rotate": ["get", "bearing"], "icon-rotation-alignment": "map", "icon-allow-overlap": true }, paint: { "icon-color": "#22d3ee" } },
            { id: "vehicle-marker", type: "symbol", source: "vehicles", layout: { "icon-image": "triangle", "icon-size": 0.8, "icon-rotate": ["get", "bearing"], "icon-rotation-alignment": "map", "icon-allow-overlap": true, "text-field": ["get", "id"], "text-font": ["Open Sans Regular"], "text-size": 11, "text-offset": [0, 1.8], "text-anchor": "top" }, paint: { "icon-color": "#facc15", "text-color": "#fff", "text-halo-color": "#000", "text-halo-width": 1.5 } },
            { id: "vehicle-dot", type: "circle", source: "vehicles", paint: { "circle-radius": 5, "circle-color": "#facc15", "circle-stroke-width": 2, "circle-stroke-color": "#000" } }
          ],
          center: [81.8463, 25.4358],
          zoom: 12
        }
      });

      // Add Drawing Tools with custom MapLibre-safe styles
      draw.current = new MapboxDraw({
        displayControlsDefault: false,
        defaultMode: 'simple_select',
        styles: DRAW_STYLES
      });
      // We don't add the control container to the map UI to prevent CSS conflicts,
      // but we still register the tool to process map click events.
      map.current.addControl(draw.current as any);

      map.current.on('draw.create', (e) => onGeofenceUpdate?.(draw.current?.getAll().features || []));
      map.current.on('draw.delete', (e) => onGeofenceUpdate?.(draw.current?.getAll().features || []));
      map.current.on('draw.update', (e) => onGeofenceUpdate?.(draw.current?.getAll().features || []));

      map.current.on("load", () => {
        const canvas = document.createElement('canvas');
        canvas.width = 32; canvas.height = 32;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(32, 32); ctx.lineTo(16, 26); ctx.lineTo(0, 32); ctx.closePath(); ctx.fill();
          map.current?.addImage('triangle', ctx.getImageData(0, 0, 32, 32));
        }
        const canvas2 = document.createElement('canvas');
        canvas2.width = 32; canvas2.height = 32;
        const ctx2 = canvas2.getContext('2d');
        if (ctx2) {
          ctx2.fillStyle = '#22d3ee'; ctx2.beginPath(); ctx2.moveTo(16, 0); ctx2.lineTo(32, 32); ctx2.lineTo(16, 26); ctx2.lineTo(0, 32); ctx2.closePath(); ctx2.fill();
          map.current?.addImage('triangle-cyan', ctx2.getImageData(0, 0, 32, 32));
        }
        animate();
      });

      return () => {
        cancelAnimationFrame(animationFrame.current);
        map.current?.remove();
        map.current = null;
      };
    } catch (err) { console.error(err); }
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[2.5rem] border border-white/5 bg-black shadow-2xl">
      <div ref={mapContainer} className="h-full w-full" />
      
      {/* Custom Drawing Controls to bypass MapboxDraw UI bugs */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            draw.current?.changeMode('draw_polygon');
          }}
          className="p-3 bg-zinc-900 border border-white/10 rounded-xl text-white shadow-xl hover:bg-indigo-600 transition-colors focus:outline-none"
          title="Draw Geofence"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 22h20L12 2z" />
          </svg>
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            draw.current?.trash();
            const features = draw.current?.getAll().features || [];
            onGeofenceUpdate?.(features);
          }}
          className="p-3 bg-zinc-900 border border-white/10 rounded-xl text-white shadow-xl hover:bg-red-600 transition-colors focus:outline-none"
          title="Delete Selection"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
