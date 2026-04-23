"use client";

import { Terminal, Copy, Check, ExternalLink, Code2, Globe, Database, History, Zap, ShieldCheck, Activity } from "lucide-react";
import { useState } from "react";

interface APIEndpoint {
  method: string;
  path: string;
  description: string;
  params: { name: string; type: string; desc: string }[];
  example: string;
}

const ENDPOINTS: APIEndpoint[] = [
  {
    method: "POST",
    path: "/api/v1/track",
    description: "Ingest live GPS telemetry for a vehicle.",
    params: [
      { name: "vehicleId", type: "string", desc: "Unique ID of the unit" },
      { name: "lat/lng", type: "number", desc: "Geographic coordinates" },
      { name: "speed", type: "number", desc: "Current speed in km/h" }
    ],
    example: `curl -X POST /api/v1/track \\
  -H "Content-Type: application/json" \\
  -d '{"vehicleId": "V-100", "lat": 25.43, "lng": 81.84}'`
  },
  {
    method: "GET",
    path: "/api/v1/fleet",
    description: "Retrieve latest positions of all units (Redis Powered).",
    params: [],
    example: `curl -X GET /api/v1/fleet`
  },
  {
    method: "GET",
    path: "/api/v1/history/[id]",
    description: "Fetch historical time-series path for a unit.",
    params: [
      { name: "start", type: "ISO-8601", desc: "Start time filter" },
      { name: "end", type: "ISO-8601", desc: "End time filter" }
    ],
    example: `curl -X GET "/api/v1/history/V-100?start=2024-04-20T00:00:00Z"`
  },
  {
    method: "GET",
    path: "/api/v1/route",
    description: "Calculate optimized driving route between two points.",
    params: [
      { name: "start", type: "string", desc: "lng,lat" },
      { name: "end", type: "string", desc: "lng,lat" }
    ],
    example: `curl -X GET "/api/v1/route?start=81.8,25.4&end=81.9,25.5"`
  },
  {
    method: "GET",
    path: "/api/v1/assets",
    description: "List all registered fleet assets with metadata.",
    params: [],
    example: `curl -X GET /api/v1/assets`
  },
  {
    method: "GET",
    path: "/api/v1/analytics",
    description: "Fetch aggregated performance intelligence.",
    params: [
      { name: "days", type: "number", desc: "History range (default 7)" }
    ],
    example: `curl -X GET "/api/v1/analytics?days=30"`
  },
  {
    method: "POST",
    path: "/api/v1/webhooks",
    description: "Register an external endpoint for real-time alerts.",
    params: [
      { name: "url", type: "string", desc: "Destination URL" },
      { name: "events", type: "array", desc: "e.g. ['geofence.entry']" }
    ],
    example: `curl -X POST /api/v1/webhooks \\
  -d '{"url": "https://myapp.com/hook", "events": ["geofence.entry"]}'`
  }
];

export function APIPanel() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex flex-col gap-10 pb-12">
      {/* Platform Status Header */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Fleet Engine: Online</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
          <Zap className="h-3 w-3 text-blue-400" />
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Redis Cache: Active</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
          <ShieldCheck className="h-3 w-3 text-purple-400" />
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">v1.0.0 Enterprise</span>
        </div>
      </div>

      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl">
            <Code2 className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-black font-outfit tracking-tight text-white">API Reference</h1>
        </div>
        <p className="text-sm text-white/50 max-w-xl leading-relaxed">
          The OpenTrack Fleet Engine exposes a robust set of RESTful endpoints designed for high-concurrency enterprise applications. Authenticate using your demo session token or API keys.
        </p>
      </header>

      <div className="space-y-16">
        {ENDPOINTS.map((api, idx) => (
          <section key={idx} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
            <div className="flex items-center gap-4">
              <span className={`text-[11px] font-black px-3 py-1 rounded-lg ${api.method === 'POST' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/20 text-blue-400 border border-blue-500/20'}`}>
                {api.method}
              </span>
              <code className="text-sm font-mono text-white/90 font-bold bg-white/5 px-3 py-1 rounded-lg border border-white/10">{api.path}</code>
            </div>
            
            <p className="text-xs text-white/60 font-medium leading-relaxed">{api.description}</p>

            {api.params.length > 0 && (
              <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
                <table className="w-full text-[11px]">
                  <thead className="bg-white/5 text-white/30 text-left border-b border-white/5">
                    <tr>
                      <th className="px-6 py-3 font-bold uppercase tracking-wider">Parameter</th>
                      <th className="px-6 py-3 font-bold uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 font-bold uppercase tracking-wider">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {api.params.map((p, pIdx) => (
                      <tr key={pIdx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-3 font-mono text-indigo-400 font-bold">{p.name}</td>
                        <td className="px-6 py-3 text-white/30 font-mono text-[10px]">{p.type}</td>
                        <td className="px-6 py-3 text-white/60">{p.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="relative group">
              <div className="absolute right-4 top-4 z-10">
                <button
                  onClick={() => copyToClipboard(api.example, api.path)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/40 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest"
                >
                  {copied === api.path ? <><Check className="h-3 w-3 text-emerald-400" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
                </button>
              </div>
              <pre className="p-6 rounded-[1.5rem] bg-[#0a0a0a] border border-white/10 overflow-x-auto text-[11px] font-mono leading-relaxed text-indigo-300/90 shadow-2xl">
                {api.example}
              </pre>
            </div>
          </section>
        ))}
      </div>

      {/* Integration Callout */}
      <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-indigo-600/20 flex items-start gap-6">
        <div className="p-3 bg-indigo-600/20 rounded-2xl">
          <Activity className="h-6 w-6 text-indigo-400" />
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-black text-white uppercase tracking-wider font-outfit">Integration Hub & Webhooks</h4>
          <p className="text-xs text-indigo-300/60 leading-relaxed max-w-lg">
            Stream geofence violations, safety alerts, and fleet status changes directly to your enterprise backend. We support standard JSON POST payloads with X-OpenTrack-Signature verification.
          </p>
        </div>
      </div>
    </div>
  );
}
