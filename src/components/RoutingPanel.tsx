"use client";

import { useState } from "react";
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
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'OpenTrack-Fleet-Console/1.0',
        }
      }
    );
    const data = await res.json();
    if (data && data.length > 0) {
      return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
    }
    throw new Error(`Location not found: ${query}`);
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
        throw new Error("Could not find a driving route between these points.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <div className="absolute left-3 top-3.5 text-emerald-500">
          <MapPin className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={startQuery}
          onChange={(e) => setStartQuery(e.target.value)}
          placeholder="Starting Point (e.g. Duomo, Florence)"
          className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
      </div>

      <div className="relative">
        <div className="absolute left-3 top-3.5 text-rose-500">
          <MapPin className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={endQuery}
          onChange={(e) => setEndQuery(e.target.value)}
          placeholder="Destination (e.g. Firenze SMN)"
          className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
      </div>

      {error && <p className="text-rose-400 text-[10px] font-medium px-1">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={calculateRoute}
          disabled={loading || !startQuery || !endQuery}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-500 active:scale-95 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
          Get Directions
        </button>
        <button
          onClick={() => {
            setStartQuery("");
            setEndQuery("");
            onClear();
          }}
          className="rounded-xl bg-white/5 border border-white/10 p-3 text-white/60 hover:text-white hover:bg-white/10 transition-all"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
