"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("owner@example.com");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const client = getSupabaseBrowserClient();
      if (!client) {
        throw new Error("Missing Supabase client configuration.");
      }

      const { error: signInError } = await client.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      router.push("/");
      router.refresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unexpected login error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6">
      <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-[var(--panel)] p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
          Sign in
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-white">
          Access the admin console
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
          Demo seeded credentials are prefilled. Replace them with any valid Supabase user if needed.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none transition focus:border-[var(--accent)]"
            placeholder="Email"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none transition focus:border-[var(--accent)]"
            placeholder="Password"
          />
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[var(--accent)] px-5 py-4 text-sm font-semibold text-slate-950 transition hover:bg-[#2dd4bf] disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
