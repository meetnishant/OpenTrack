"use client";

import { motion } from "framer-motion";
import { Map, Zap, Shield, BarChart3, ChevronRight } from "lucide-react";
import { LoginButton } from "@/components/LoginButton";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium backdrop-blur-md"
        >
          <span className="flex h-2 w-2 rounded-full bg-indigo-500" />
          <span className="text-white/60">v1.0 Now in Private Beta</span>
        </motion.div>

        {/* Hero Section */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-4xl font-outfit text-6xl font-bold tracking-tight sm:text-8xl"
        >
          Your Fleet, <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Reimagined in Real-time.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 max-w-2xl text-lg leading-relaxed text-white/50"
        >
          The first open-source tracking platform that combines high-fidelity MapLibre rendering 
          with cost-free Protomaps hosting. Deep intelligence for modern logistics.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 flex flex-col items-center gap-6"
        >
          <LoginButton />
          <div className="flex items-center gap-8 text-white/40 grayscale transition-all hover:grayscale-0">
             <span className="flex items-center gap-1.5"><Shield className="h-4 w-4" /> Secure Auth</span>
             <span className="flex items-center gap-1.5"><Zap className="h-4 w-4" /> Live Sync</span>
          </div>
        </motion.div>

        {/* Feature Grid Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-24 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl w-full"
        >
          {[
            { icon: Map, title: "Zero Mapping Tax", desc: "Self-hosted Protomaps tiles." },
            { icon: BarChart3, title: "Fleet Intelligence", desc: "Speed, fuel, and route analysis." },
            { icon: Zap, title: "60 FPS Rendering", desc: "GPU-accelerated vector motion." },
            { icon: Shield, title: "Private & Secure", desc: "Total sovereignty over your data." }
          ].map((feature, i) => (
            <div key={i} className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-left transition-all hover:bg-white/[0.05]">
              <feature.icon className="h-8 w-8 text-indigo-400 mb-4" />
              <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">{feature.title}</h3>
              <p className="mt-2 text-sm text-white/40 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Decorative Blur and Bottom Fade */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black to-transparent z-0" />
    </div>
  );
}
