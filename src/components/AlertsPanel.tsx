"use client";

import { ShieldAlert, Trash2, Map, Bell, Clock, Info } from "lucide-react";

interface AlertsPanelProps {
  geofences: any[];
  alerts: any[];
  onRemoveGeofence: (id: string) => void;
}

export function AlertsPanel({ geofences, alerts, onRemoveGeofence }: AlertsPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Active Zones */}
      <section>
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mb-4 flex items-center gap-2">
          <Map className="h-3 w-3" /> Active Zones
        </h3>
        {geofences.length === 0 ? (
          <div className="rounded-xl bg-white/5 border border-dashed border-white/10 p-6 text-center">
            <p className="text-[10px] text-white/30 uppercase tracking-widest leading-relaxed">
              Use the polygon tool on the map<br/>to draw a safety zone
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {geofences.map((fence) => (
              <div key={fence.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 group hover:border-indigo-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <ShieldAlert className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/80">Zone {fence.id.slice(0,4)}</p>
                    <p className="text-[9px] text-white/30 uppercase font-bold tracking-wider">Geofence Active</p>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveGeofence(fence.id)}
                  className="p-2 rounded-lg text-white/20 hover:text-rose-400 hover:bg-rose-400/10 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Violation Feed */}
      <section className="flex-1 min-h-0 flex flex-col">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mb-4 flex items-center gap-2">
          <Bell className="h-3 w-3" /> Live Violations
        </h3>
        {alerts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 opacity-20">
            <Bell className="h-8 w-8" />
            <p className="text-[10px] font-bold uppercase tracking-widest">No alerts detected</p>
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
            {alerts.map((alert, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-start justify-between mb-1">
                  <span className="text-[10px] font-bold text-rose-400 bg-rose-400/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                    {alert.type}
                  </span>
                  <span className="text-[9px] text-white/20 font-mono flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" /> {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs text-white/80 font-medium">
                  <span className="font-bold text-white">{alert.vehicleId}</span> {alert.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
      
      <div className="mt-4 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-3">
        <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
        <p className="text-[10px] text-indigo-300/60 leading-relaxed font-medium">
          Alerts are processed in real-time using Turf.js spatial analysis on the edge.
        </p>
      </div>
    </div>
  );
}
