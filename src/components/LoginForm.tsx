"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { LogIn, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [username, setUsername] = useState("demo");
  const [password, setPassword] = useState("Secrte#123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid credentials. Try demo / Secrte#123");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
      <div className="flex flex-col gap-2 text-left">
        <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          placeholder="demo"
        />
      </div>
      <div className="flex flex-col gap-2 text-left">
        <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          placeholder="••••••••"
        />
      </div>

      {error && <p className="text-red-400 text-xs font-medium">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-xl bg-white px-8 py-4 text-sm font-semibold text-black transition-all active:scale-95 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <span className="relative z-10 text-base">Enter Console</span>
            <LogIn className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </>
        )}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 transition-opacity group-hover:opacity-10" />
      </button>
      
      <p className="text-white/30 text-[10px] text-center uppercase tracking-widest mt-2">
        Secured via OpenTrack Auth Protocol
      </p>
    </form>
  );
}
