"use client";

import { useEffect, useState, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import { io } from "socket.io-client";
import MapComponent from "@/components/MapComponent";
import { RoutingPanel } from "@/components/RoutingPanel";
import { VehicleList } from "@/components/VehicleList";
import { PlaybackPanel } from "@/components/PlaybackPanel";
import { AlertsPanel } from "@/components/AlertsPanel";
import { LogOut, Map as MapIcon, Navigation, Activity, LayoutDashboard, History, Bell, Code, ChevronRight } from "lucide-react";
import { Vehicle } from "@/types/vehicle";
import { clsx } from "clsx";
import * as turf from "@turf/turf";
import Link from "next/link";

type Tab = "live" | "history" | "routing" | "alerts";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("live");
  const [routeData, setRouteData] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any>(null);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  
  // Geofencing & Alerts
  const [geofences, setGeofences] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const vehicleStates = useRef<{ [key: string]: { [fenceId: string]: boolean } }>({});

  const [fleet, setFleet] = useState<{ [key: string]: Vehicle }>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const fleetRef = useRef<{ [key: string]: Vehicle }>({});

  if (status === "unauthenticated") redirect("/");

  // Request Notification Permission
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    const socket = io(socketUrl);

    socket.on("v_upd", (data) => {
      const prev = fleetRef.current[data.id];
      let bearing = prev?.bearing || 0;
      
      if (prev) {
        const dy = data.lat - prev.currentLngLat[1];
        const dx = data.lng - prev.currentLngLat[0];
        if (Math.abs(dx) > 0.00001 || Math.abs(dy) > 0.00001) {
          bearing = (Math.atan2(dx, dy) * 180) / Math.PI;
        }
      }

      const updatedVehicle: Vehicle = {
        id: data.id,
        currentLngLat: prev ? prev.currentLngLat : [data.lng, data.lat],
        targetLngLat: [data.lng, data.lat],
        bearing: bearing,
        speed: data.speed,
        passengers: data.passengers
      };

      // Real-time Geofence Check
      if (geofences.length > 0) {
        const pt = turf.point([data.lng, data.lat]);
        geofences.forEach(fence => {
          const isInside = turf.booleanPointInPolygon(pt, fence);
          const wasInside = vehicleStates.current[data.id]?.[fence.id] || false;

          if (isInside && !wasInside) {
            const msg = `${data.id} entered Safety Zone ${fence.id.slice(0, 4)}`;
            setAlerts(prev => [{
              vehicleId: data.id,
              type: "Entry",
              message: msg,
              timestamp: new Date()
            }, ...prev].slice(0, 50));

            if (Notification.permission === "granted") {
              new Notification("🚧 Geofence Alert", { body: msg, icon: "/favicon.ico" });
            }
          } else if (!isInside && wasInside) {
            const msg = `${data.id} exited Safety Zone ${fence.id.slice(0, 4)}`;
            setAlerts(prev => [{
              vehicleId: data.id,
              type: "Exit",
              message: msg,
              timestamp: new Date()
            }, ...prev].slice(0, 50));

            if (Notification.permission === "granted") {
              new Notification("🚧 Geofence Alert", { body: msg, icon: "/favicon.ico" });
            }
          }

          if (!vehicleStates.current[data.id]) vehicleStates.current[data.id] = {};
          vehicleStates.current[data.id][fence.id] = isInside;
        });
      }

      fleetRef.current[data.id] = updatedVehicle;
      setFleet({ ...fleetRef.current });
    });

    const lerp = () => {
      const lerpFactor = 0.05;
      let changed = false;
      Object.values(fleetRef.current).forEach((v) => {
        const dLng = v.targetLngLat[0] - v.currentLngLat[0];
        const dLat = v.targetLngLat[1] - v.currentLngLat[1];
        if (Math.abs(dLng) > 0.000001 || Math.abs(dLat) > 0.000001) {
          v.currentLngLat[0] += dLng * lerpFactor;
          v.currentLngLat[1] += dLat * lerpFactor;
          changed = true;
        }
      });
      if (changed) setFleet({ ...fleetRef.current });
      requestAnimationFrame(lerp);
    };
    const anim = requestAnimationFrame(lerp);

    return () => {
      socket.disconnect();
      cancelAnimationFrame(anim);
    };
  }, [geofences]);

  if (status === "loading") return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-inter flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 bg-zinc-950 border-r border-white/5 flex flex-col h-screen shrink-0 relative z-50">
        <div className="p-6 pb-2">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <MapIcon className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold font-outfit tracking-tight">OpenTrack</h1>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-white/5 p-1 rounded-xl mb-8">
            {[
              { id: "live", icon: Activity, label: "Live" },
              { id: "history", icon: History, label: "Replay" },
              { id: "routing", icon: Navigation, label: "Nav" },
              { id: "alerts", icon: Bell, label: "Alert" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={clsx(
                  "flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all",
                  activeTab === tab.id ? "bg-zinc-800 text-white shadow-lg" : "text-white/30 hover:text-white/60"
                )}
              >
                <tab.icon className="h-3 w-3" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {activeTab === "live" && (
              <section className="animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 flex items-center gap-2">
                    <LayoutDashboard className="h-3 w-3" /> Fleet Status
                  </h3>
                  <span className="text-[10px] font-bold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-full">{Object.keys(fleet).length} Units</span>
                </div>
                <VehicleList 
                  vehicles={Object.values(fleet)} 
                  onSelect={(id) => setSelectedId(id)} 
                  selectedId={selectedId} 
                />
              </section>
            )}

            {activeTab === "history" && (
              <section className="animate-in fade-in slide-in-from-left-4 duration-300">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mb-4 flex items-center gap-2">
                  <History className="h-3 w-3" /> Time Machine
                </h3>
                <PlaybackPanel 
                  vehicleId={selectedId} 
                  onHistoryLoaded={(data) => setHistoryData(data)} 
                  onPlaybackUpdate={(idx) => setPlaybackIndex(idx)}
                />
              </section>
            )}

            {activeTab === "routing" && (
              <section className="animate-in fade-in slide-in-from-left-4 duration-300">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mb-4 flex items-center gap-2">
                  <Navigation className="h-3 w-3" /> Directions
                </h3>
                <RoutingPanel 
                  onRouteCalculated={(geom) => setRouteData(geom)} 
                  onClear={() => setRouteData(null)} 
                />
              </section>
            )}

            {activeTab === "alerts" && (
              <section className="animate-in fade-in slide-in-from-left-4 duration-300">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mb-4 flex items-center gap-2">
                  <Bell className="h-3 w-3" /> Safety Monitor
                </h3>
                <AlertsPanel 
                  geofences={geofences} 
                  alerts={alerts}
                  onRemoveGeofence={(id) => setGeofences(prev => prev.filter(f => f.id !== id))}
                />
              </section>
            )}
          </div>
        </div>

        <div className="mt-auto p-6 space-y-4">
          {/* Developer Portal Link */}
          <Link 
            href="/developer"
            className="flex items-center justify-between p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 hover:bg-indigo-500/10 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                <Code className="h-3.5 w-3.5 text-indigo-400" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">Developer Portal</span>
            </div>
            <ChevronRight className="h-3 w-3 text-white/20 group-hover:text-white transition-colors" />
          </Link>

          <div className="p-6 border-t border-white/5 bg-zinc-950/50 backdrop-blur-md rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold shadow-lg">
                {session?.user?.name?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{session?.user?.name}</p>
                <p className="text-[10px] text-white/30 font-medium uppercase tracking-wider">Fleet Admin</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 py-3 text-xs font-bold hover:bg-white/10 transition-all text-white/60 hover:text-white"
            >
              <LogOut className="h-3 w-3" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen p-4 bg-[#050505]">
        <MapComponent 
          routeData={routeData} 
          historyData={historyData}
          playbackIndex={playbackIndex}
          vehicles={fleet} 
          selectedVehicleId={selectedId} 
          onGeofenceUpdate={(fences) => setGeofences(fences)}
        />
      </main>
    </div>
  );
}
