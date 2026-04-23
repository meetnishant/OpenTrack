"use client";

import { motion } from "framer-motion";
import { Map, Zap, Shield, BarChart3 } from "lucide-react";
import { LoginForm } from "@/components/LoginForm";

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

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center py-20">
        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium backdrop-blur-md"
        >
          <span className="flex h-2 w-2 rounded-full bg-indigo-500" />
          <span className="text-white/60">Local Demo Mode Active</span>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center gap-20 max-w-7xl w-full">
          {/* Hero Content */}
          <div className="flex-1 text-center lg:text-left">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-outfit text-6xl font-bold tracking-tight sm:text-7xl leading-[1.1]"
            >
              Your Fleet, <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Reimagined.
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 max-w-xl text-lg leading-relaxed text-white/50"
            >
              The first open-source tracking platform that combines high-fidelity MapLibre rendering 
              with cost-free Protomaps hosting.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-12 grid grid-cols-2 gap-4 max-w-md"
            >
              {[
                { icon: Map, title: "Zero Tax" },
                { icon: BarChart3, title: "Intelligence" },
                { icon: Zap, title: "60 FPS" },
                { icon: Shield, title: "Private" }
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                  <feature.icon className="h-5 w-5 text-indigo-400" />
                  <span className="text-sm font-medium text-white/70">{feature.title}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Login Side */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="flex-1 w-full max-w-md"
          >
            <div className="relative rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-10 backdrop-blur-2xl shadow-2xl">
              <div className="mb-8">
                <h2 className="text-2xl font-bold font-outfit">Console Login</h2>
                <p className="text-white/40 text-sm mt-1">Access the live tracking dashboard</p>
              </div>
              <LoginForm />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
