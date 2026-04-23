"use client";

import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Clock, Calendar, Download, Loader2, FastForward } from "lucide-react";

interface PlaybackPanelProps {
  vehicleId: string | null;
  onHistoryLoaded: (data: any) => void;
  onPlaybackUpdate: (index: number) => void;
}

export function PlaybackPanel({ vehicleId, onHistoryLoaded, onPlaybackUpdate }: PlaybackPanelProps) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<any>(null);
  
  // Playback state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1);

  const loadHistory = async () => {
    if (!vehicleId || !start || !end) return;
    setLoading(true);
    setError("");
    setHistory(null);
    setCurrentIndex(0);
    setIsPlaying(false);

    try {
      const res = await fetch(`/api/v1/history/${vehicleId}?start=${start}&end=${end}`);
      const data = await res.json();

      if (data.error) throw new Error(data.error);
      if (data.count === 0) throw new Error("No data found for this range.");

      setHistory(data);
      onHistoryLoaded(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Playback loop
  useEffect(() => {
    let interval: any;
    if (isPlaying && history && currentIndex < history.count - 1) {
      interval = setInterval(() => {
        setCurrentIndex(prev => {
          const next = prev + 1;
          return next >= history.count - 1 ? history.count - 1 : next;
        });
      }, 100 / playSpeed);
    } else if (isPlaying && history && currentIndex >= history.count - 1) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, history, currentIndex, playSpeed]);

  // Sync index to parent
  useEffect(() => {
    onPlaybackUpdate(currentIndex);
  }, [currentIndex, onPlaybackUpdate]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setCurrentIndex(val);
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

          {!history ? (
            <button
              onClick={loadHistory}
              disabled={loading || !start || !end}
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
              Load History
            </button>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Playback Controls */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => { setCurrentIndex(0); onPlaybackUpdate(0); setIsPlaying(false); }}
                      className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white transition-colors"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex bg-white/5 rounded-lg p-1">
                    {[1, 5, 10].map(speed => (
                      <button
                        key={speed}
                        onClick={() => setPlaySpeed(speed)}
                        className={`px-2 py-1 text-[9px] font-bold rounded ${playSpeed === speed ? 'bg-zinc-700 text-white' : 'text-white/30'}`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max={history.count - 1}
                  value={currentIndex}
                  onChange={handleSliderChange}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />

                <div className="flex justify-between mt-2">
                  <span className="text-[10px] text-white/30 font-mono">
                    {new Date(history.path.properties.points[currentIndex].timestamp).toLocaleTimeString()}
                  </span>
                  <span className="text-[10px] text-indigo-400 font-bold">
                    {Math.round(history.path.properties.points[currentIndex].speed || 0)} km/h
                  </span>
                </div>
              </div>

              <button
                onClick={() => setHistory(null)}
                className="w-full py-2 text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-white/40 transition-colors"
              >
                Clear History
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
