"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setError("");
    setMessage("");

    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data.session) {
      router.push("/mole-map");
    } else {
      setMessage(
        "Account created! Please check your email to confirm your account."
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#FFF5F9] text-[#480A23] flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">

        <Image
          src="/logo.png.png"
          alt="SkinMonitor logo"
          width={150}
          height={150}
          className="mx-auto"
        />

        <h1 className="mt-4 text-4xl font-semibold">
          Create your account
        </h1>

        <p className="mt-3 text-[#480A23]/70">
          Start building your personal mole map.
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
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-[#E8B8C8] bg-white px-4 py-3 outline-none focus:border-[#9C526F]"
          />
        </div>

        <div className="mt-5 text-left">
          <label className="text-sm font-medium">
            Confirm password
          </label>

          <input
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            className="mt-2 w-full rounded-2xl border border-[#E8B8C8] bg-white px-4 py-3 outline-none focus:border-[#9C526F]"
          />
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}

        {message && (
          <p className="mt-4 text-sm text-green-700">
            {message}
          </p>
        )}

        <button
          onClick={handleSignUp}
          disabled={loading}
          className="mt-8 w-full rounded-full bg-[#9C526F] py-4 font-medium text-white transition hover:bg-[#480A23] disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="mt-6 text-sm text-[#480A23]/70">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-[#9C526F] hover:text-[#480A23]"
          >
            Log in
          </Link>
        </p>

      </div>
    </main>
  );
}