"use client";

import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import MapComponent from "@/components/MapComponent";

export default function DashboardPage() {
  const { data: session, status } = useSession();

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
    <div className="min-h-screen bg-black p-8 text-white">
      <div className="mx-auto max-w-7xl h-[calc(100vh-64px)] flex flex-col">
        <header className="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
          <div>
            <h1 className="text-3xl font-bold font-outfit">OpenTrack Console</h1>
            <p className="mt-1 text-sm text-white/40">Fleet Overview • Monaco Test Area</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/30">{session?.user?.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-full bg-white/5 px-6 py-2 text-xs font-semibold transition-colors hover:bg-white/10"
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="flex-1 relative">
          <MapComponent />
        </main>
      </div>
    </div>
  );
}
