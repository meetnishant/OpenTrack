"use client";

import { signIn } from "next-auth/react";
import { LogIn } from "lucide-react";

export function LoginButton() {
  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-white px-8 py-4 text-sm font-semibold text-black transition-all hover:pr-12 active:scale-95"
    >
      <span className="relative z-10">Sign in with Google</span>
      <LogIn className="absolute right-4 h-4 w-4 translate-x-8 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 transition-opacity group-hover:opacity-10" />
    </button>
  );
}
