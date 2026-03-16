"use client";

import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type AuthGateProps = {
  children: (session: Session) => React.ReactNode;
};

export function AuthGate({ children }: AuthGateProps) {
  const client = getSupabaseBrowserClient();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(Boolean(client));
  const [error, setError] = useState<string | null>(client ? null : "Missing Supabase client configuration.");

  useEffect(() => {
    if (!client) {
      return;
    }

    client.auth.getSession().then(({ data, error: sessionError }) => {
      if (sessionError) {
        setError(sessionError.message);
      }
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [client]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-white/80">
        Checking session...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-400/20 bg-red-500/10 p-8 text-red-100">
        {error}
      </div>
    );
  }

  if (!session) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.25em] text-[var(--accent)]">
          Authentication required
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-white">
          Sign in to manage your contractor workspace.
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--muted)]">
          Use one of the seeded demo users from Supabase or your own account once you create it.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#2dd4bf]"
        >
          Open login
        </Link>
      </div>
    );
  }

  return <>{children(session)}</>;
}
