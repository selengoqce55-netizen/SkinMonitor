"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError("Invalid email or password.");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-[#FFF5F9] text-[#480A23] flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">

        <Image
          src="/logo.png.png"
          alt="SkinMonitor logo"
          width={200}
          height={200}
          className="mx-auto"
        />

        <h1 className="mt-4 text-4xl font-semibold">
          Welcome back
        </h1>

        <p className="mt-3 text-[#480A23]/70">
          Log in to your SkinMonitor account
        </p>

        <div className="mt-8 text-left">
          <label className="text-sm font-medium">
            Email
          </label>

          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-[#E8B8C8] bg-white px-4 py-3 outline-none focus:border-[#9C526F]"
          />
        </div>

        <div className="mt-5 text-left">
          <label className="text-sm font-medium">
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-[#E8B8C8] bg-white px-4 py-3 outline-none focus:border-[#9C526F]"
          />
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="mt-8 w-full rounded-full bg-[#9C526F] py-4 font-medium text-white transition hover:bg-[#480A23] disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>

        <p className="mt-6 text-sm text-[#480A23]/70">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-[#9C526F] underline-offset-4 hover:underline hover:text-[#480A23]"
          >
            Create account
          </Link>
        </p>

      </div>
    </main>
  );
}