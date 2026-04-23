"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Navigation, X, Loader2 } from "lucide-react";

interface RoutingPanelProps {
  onRouteCalculated: (geometry: any) => void;
  onClear: () => void;
}

export function RoutingPanel({ onRouteCalculated, onClear }: RoutingPanelProps) {
  const [startQuery, setStartQuery] = useState("");
  const [endQuery, setEndQuery] = useState("");
  const [startSuggestions, setStartSuggestions] = useState<any[]>([]);
  const [endSuggestions, setEndSuggestions] = useState<any[]>([]);
  const [startCoord, setStartCoord] = useState<number[] | null>(null);
  const [endCoord, setEndCoord] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSuggestions = async (query: string, setFn: (data: any[]) => void) => {
    if (query.length < 3) {
      setFn([]);
      return;
    }
    try {
      const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      setFn(data.features || []);
    } catch (err) {
      console.error("Suggestion fetch failed", err);
    }
  };

  // Debounced search for start
  useEffect(() => {
    const timer = setTimeout(() => fetchSuggestions(startQuery, setStartSuggestions), 300);
    return () => clearTimeout(timer);
  }, [startQuery]);

  // Debounced search for end
  useEffect(() => {
    const timer = setTimeout(() => fetchSuggestions(endQuery, setEndSuggestions), 300);
    return () => clearTimeout(timer);
  }, [endQuery]);

  const calculateRoute = async () => {
    if (!startCoord || !endCoord) {
      setError("Please select locations from the suggestions.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startCoord[0]},${startCoord[1]};${endCoord[0]},${endCoord[1]}?overview=full&geometries=geojson`;
      const res = await fetch(osrmUrl);
      const data = await res.json();

      if (data.code === "Ok" && data.routes.length > 0) {
        onRouteCalculated(data.routes[0].geometry);
      } else {
        throw new Error("Route not found. Locations might be unreachable by car.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Start Input */}
      <div className="relative">
        <div className="absolute left-3 top-3.5 text-emerald-500">
          <MapPin className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={startQuery}
          onChange={(e) => {
            setStartQuery(e.target.value);
            setStartCoord(null);
          }}
          placeholder="Starting Point..."
          className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
        {startSuggestions.length > 0 && !startCoord && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden z-[60] shadow-2xl">
            {startSuggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  setStartQuery(s.properties.name || s.properties.street || "Selected Location");
                  setStartCoord(s.geometry.coordinates);
                  setStartSuggestions([]);
                }}
                className="w-full px-4 py-3 text-left text-xs hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
              >
                <p className="font-bold text-white">{s.properties.name || s.properties.street}</p>
                <p className="text-white/40 truncate">{s.properties.city}, {s.properties.country}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* End Input */}
      <div className="relative">
        <div className="absolute left-3 top-3.5 text-rose-500">
          <MapPin className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={endQuery}
          onChange={(e) => {
            setEndQuery(e.target.value);
            setEndCoord(null);
          }}
          placeholder="Destination..."
          className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
        />
        {endSuggestions.length > 0 && !endCoord && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden z-[60] shadow-2xl">
            {endSuggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  setEndQuery(s.properties.name || s.properties.street || "Selected Location");
                  setEndCoord(s.geometry.coordinates);
                  setEndSuggestions([]);
                }}
                className="w-full px-4 py-3 text-left text-xs hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
              >
                <p className="font-bold text-white">{s.properties.name || s.properties.street}</p>
                <p className="text-white/40 truncate">{s.properties.city}, {s.properties.country}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3">
          <p className="text-rose-400 text-[10px] font-semibold">{error}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={calculateRoute}
          disabled={loading || !startCoord || !endCoord}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 active:scale-95 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
          Get Directions
        </button>
        <button
          onClick={() => {
            setStartQuery("");
            setEndQuery("");
            setStartCoord(null);
            setEndCoord(null);
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
