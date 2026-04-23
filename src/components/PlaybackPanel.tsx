"use client";

import { useState } from "react";
import { Play, Pause, RotateCcw, Clock, Calendar, Download, Loader2 } from "lucide-react";

interface PlaybackPanelProps {
  vehicleId: string | null;
  onHistoryLoaded: (data: any) => void;
}

export function PlaybackPanel({ vehicleId, onHistoryLoaded }: PlaybackPanelProps) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadHistory = async () => {
    if (!vehicleId || !start || !end) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/v1/history/${vehicleId}?start=${start}&end=${end}`);
      const data = await res.json();

      if (data.error) throw new Error(data.error);
      if (data.count === 0) throw new Error("No data found for this range.");

      onHistoryLoaded(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {!vehicleId ? (
        <div className="rounded-xl bg-white/5 border border-dashed border-white/10 p-6 text-center">
          <p className="text-[10px] text-white/30 uppercase tracking-widest">Select a vehicle first</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider ml-1">Start Time</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-3.5 w-3.5 text-indigo-500" />
                <input
                  type="datetime-local"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider ml-1">End Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-3.5 w-3.5 text-rose-500" />
                <input
                  type="datetime-local"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3">
              <p className="text-rose-400 text-[10px] font-semibold">{error}</p>
            </div>
          )}

          <button
            onClick={loadHistory}
            disabled={loading || !start || !end}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
            Load History
          </button>
        </>
      )}
    </div>
  );
}
