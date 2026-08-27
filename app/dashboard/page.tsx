"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      alert("Could not log out.");
      return;
    }

    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-[#FFF5F9] text-[#480A23] px-6 py-12">

      <section className="mx-auto max-w-4xl text-center">

        <h1 className="text-5xl font-semibold">
          Welcome back
        </h1>

        <p className="mt-4 text-lg text-[#480A23]/70">
          Continue monitoring your skin with SkinMonitor.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">

          <Link
            href="/mole-map"
            className="rounded-3xl bg-[#9C526F] px-8 py-10 text-xl font-semibold text-white transition hover:bg-[#480A23]"
          >
            My Mole Map
          </Link>

          <Link
            href="/change"
            className="rounded-3xl bg-[#9C526F] px-8 py-10 text-xl font-semibold text-white transition hover:bg-[#480A23]"
          >
            Changes
          </Link>

          <Link
            href="/uv-exposure"
            className="rounded-3xl bg-[#9C526F] px-8 py-10 text-xl font-semibold text-white transition hover:bg-[#480A23]"
          >
            UV Exposure
          </Link>

          <Link
            href="/meaning-of-project"
            className="rounded-3xl bg-[#9C526F] px-8 py-10 text-xl font-semibold text-white transition hover:bg-[#480A23]"
          >
            Meaning of Project
          </Link>

        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-10 rounded-full border border-[#480A23]/20 px-8 py-3 font-medium text-[#480A23] transition hover:bg-[#480A23] hover:text-white"
        >
          Log Out
        </button>

      </section>

    </main>
  );
}