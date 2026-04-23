"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Navigation, X, Loader2 } from "lucide-react";

interface RoutingPanelProps {
  onRouteCalculated: (geometry: any) => void;
  onClear: () => void;
}

export function RoutingPanel({ onRouteCalculated, onClear }: RoutingPanelProps) {
  const [startQuery, setStartQuery] = useState("");
  const [endQuery, setEndQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const geocode = async (query: string) => {
    // Attempt 1: Full Query
    let res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { 'User-Agent': 'OpenTrack-Fleet-Console/1.0' } }
    );
    let data = await res.json();

    // Attempt 2: Fallback to first 3 words (Fuzzy match logic)
    if ((!data || data.length === 0) && query.split(" ").length > 2) {
      const simplified = query.split(" ").slice(0, 3).join(" ");
      res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(simplified)}&format=json&limit=1`,
        { headers: { 'User-Agent': 'OpenTrack-Fleet-Console/1.0' } }
      );
      data = await res.json();
    }

    if (data && data.length > 0) {
      return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
    }
    throw new Error(`Location not found: "${query}". Please check spelling.`);
  };

  const calculateRoute = async () => {
    if (!startQuery || !endQuery) return;
    setLoading(true);
    setError("");

    try {
      const startCoord = await geocode(startQuery);
      const endCoord = await geocode(endQuery);

      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startCoord[0]},${startCoord[1]};${endCoord[0]},${endCoord[1]}?overview=full&geometries=geojson`;
      const res = await fetch(osrmUrl);
      const data = await res.json();

      if (data.code === "Ok" && data.routes.length > 0) {
        onRouteCalculated(data.routes[0].geometry);
      } else {
        throw new Error("Route not found. Locations might be across oceans or unreachable.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative group">
        <div className="absolute left-3 top-3.5 text-emerald-500 group-focus-within:scale-110 transition-transform">
          <MapPin className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={startQuery}
          onChange={(e) => setStartQuery(e.target.value)}
          placeholder="Start address..."
          className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
        />
      </div>

      <div className="relative group">
        <div className="absolute left-3 top-3.5 text-rose-500 group-focus-within:scale-110 transition-transform">
          <MapPin className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={endQuery}
          onChange={(e) => setEndQuery(e.target.value)}
          placeholder="Destination address..."
          className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3">
          <p className="text-rose-400 text-[10px] font-semibold leading-relaxed">{error}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={calculateRoute}
          disabled={loading || !startQuery || !endQuery}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 active:scale-95 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
          Calculate Route
        </button>
        <button
          onClick={() => {
            setStartQuery("");
            setEndQuery("");
            onClear();
            setError("");
          }}
          className="rounded-xl bg-white/5 border border-white/10 p-3 text-white/60 hover:text-white hover:bg-white/10 transition-all"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
