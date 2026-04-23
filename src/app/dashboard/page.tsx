"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import MapComponent from "@/components/MapComponent";
import { RoutingPanel } from "@/components/RoutingPanel";
import { LogOut, Map as MapIcon, Navigation, Activity } from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [routeData, setRouteData] = useState<any>(null);

  if (status === "unauthenticated") {
    redirect("/");
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-inter">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-80 bg-zinc-950 border-r border-white/5 p-6 flex flex-col z-50">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 bg-indigo-500 rounded-lg">
            <MapIcon className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold font-outfit tracking-tight">OpenTrack</h1>
        </div>

        <nav className="flex-1 space-y-8">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-4 px-1">Navigation</h3>
            <RoutingPanel 
              onRouteCalculated={(geom) => setRouteData(geom)} 
              onClear={() => setRouteData(null)} 
            />
          </div>

          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-4 px-1">System</h3>
            <div className="space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all">
                <Activity className="h-4 w-4" />
                Fleet Health
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all">
                <Navigation className="h-4 w-4" />
                Live Dispatch
              </button>
            </div>
          </div>
        </nav>

        <div className="pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 mb-6 px-1">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold">
              {session?.user?.name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{session?.user?.name}</p>
              <p className="text-[10px] text-white/30 truncate">Administrator</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 py-3 text-sm font-semibold hover:bg-white/10 transition-all text-white/80"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-80 h-screen p-4">
        <MapComponent routeData={routeData} />
      </main>
    </div>
  );
}
