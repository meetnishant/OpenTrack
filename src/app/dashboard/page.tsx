"use client";

import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";

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
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between border-b border-white/10 pb-8">
          <div>
            <h1 className="text-4xl font-bold">Fleet Dashboard</h1>
            <p className="mt-2 text-white/50">Welcome back, {session?.user?.name}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-full bg-white/5 px-6 py-2 text-sm font-medium transition-colors hover:bg-white/10"
          >
            Sign out
          </button>
        </header>

        <main className="mt-12">
          <div className="rounded-3xl border border-dashed border-white/20 p-24 text-center">
            <p className="text-white/40 italic">Map System Offline - Implementation starting in Story 1</p>
          </div>
        </main>
      </div>
    </div>
  );
}
