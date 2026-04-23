"use client";

import { APIPanel } from "@/components/APIPanel";
import { ChevronLeft, Code2, Globe, BookOpen, ExternalLink, Cpu } from "lucide-react";
import Link from "next/link";

export default function DeveloperPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-inter">
      {/* Top Navigation */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-1.5 bg-indigo-600 rounded-lg group-hover:scale-110 transition-transform">
              <Code2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold font-outfit tracking-tight">OpenTrack Dev</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-xs font-bold text-white/40 hover:text-white transition-colors">Dashboard</Link>
            <a href="https://github.com/meetnishant/OpenTrack" target="_blank" className="text-xs font-bold text-white/40 hover:text-white transition-colors flex items-center gap-2">
               GitHub
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12 flex gap-12">
        {/* Left Sidebar (Nav) */}
        <aside className="w-64 shrink-0 hidden lg:block sticky top-28 h-fit">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mb-6">Introduction</h4>
          <nav className="space-y-1 mb-10">
            <button className="w-full text-left px-3 py-2 rounded-lg bg-white/5 text-xs font-bold text-indigo-400">API Reference</button>
            <button className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-white/40 hover:text-white hover:bg-white/5 transition-all">Authentication</button>
            <button className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-white/40 hover:text-white hover:bg-white/5 transition-all">Webhooks</button>
          </nav>

          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mb-6">Resources</h4>
          <nav className="space-y-1">
            <button className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-white/40 hover:text-white hover:bg-white/5 transition-all flex items-center justify-between">
              Postman Coll. <ExternalLink className="h-3 w-3" />
            </button>
            <button className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-white/40 hover:text-white hover:bg-white/5 transition-all flex items-center justify-between">
              SDKs <ExternalLink className="h-3 w-3" />
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-3xl">
          <div className="mb-12">
            <h1 className="text-4xl font-black font-outfit mb-4 bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
              Developer Reference
            </h1>
            <p className="text-lg text-white/40 leading-relaxed">
              Integrate real-time fleet intelligence into your own stack. Use our REST APIs to track units, calculate routes, and manage geofences programmatically.
            </p>
          </div>

          <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Cpu className="h-32 w-32 text-indigo-500" />
            </div>
            <APIPanel />
          </div>
        </main>
      </div>
    </div>
  );
}
