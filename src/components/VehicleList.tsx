"use client";

import { useState } from "react";
import { Search, Bus, Info, ChevronRight, Activity } from "lucide-react";
import { clsx } from "clsx";

import { Vehicle } from "@/types/vehicle";

interface VehicleListProps {
  vehicles: Vehicle[];
  onSelect: (id: string) => void;
  selectedId?: string | null;
}

export function VehicleList({ vehicles, onSelect, selectedId }: VehicleListProps) {
  const [search, setSearch] = useState("");

  const filtered = vehicles.filter((v) => 
    v.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="relative mb-4">
        <div className="absolute left-3 top-3 text-white/20">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Vehicle ID..."
          className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-xs text-white/20">No vehicles found</p>
          </div>
        ) : (
          filtered.map((v) => (
            <button
              key={v.id}
              onClick={() => onSelect(v.id)}
              className={clsx(
                "w-full group flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                selectedId === v.id 
                  ? "bg-indigo-500/10 border-indigo-500/50" 
                  : "bg-white/5 border-white/5 hover:bg-white/10"
              )}
            >
              <div className={clsx(
                "p-2 rounded-lg transition-colors",
                selectedId === v.id ? "bg-indigo-500 text-white" : "bg-white/5 text-white/40 group-hover:text-white"
              )}>
                <Bus className="h-4 w-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold font-outfit truncate">{v.id}</span>
                  <span className="text-[10px] font-medium text-emerald-400 flex items-center gap-1">
                    <Activity className="h-2 w-2 animate-pulse" />
                    Live
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-white/40">
                  <span>{v.speed} km/h</span>
                  <span>•</span>
                  <span>{v.passengers} Pax</span>
                </div>
              </div>

              <ChevronRight className={clsx(
                "h-4 w-4 transition-transform",
                selectedId === v.id ? "text-indigo-500 translate-x-1" : "text-white/10 group-hover:text-white/30"
              )} />
            </button>
          ))
        )}
      </div>
    </div>
  );
}
