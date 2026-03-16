"use client";

import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type SubscriptionRow = {
  plan_code: string;
  status: string;
  seats: number;
};

export function BillingDashboard() {
  const client = getSupabaseBrowserClient();
  const [session, setSession] = useState<Session | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [loading, setLoading] = useState(Boolean(client));
  const [error, setError] = useState<string | null>(client ? null : "Missing billing configuration.");
  const organizationId = process.env.NEXT_PUBLIC_DEFAULT_ORGANIZATION_ID ?? "";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID ?? "";

  useEffect(() => {
    if (!client) {
      return;
    }

    client.auth.getSession().then(({ data, error: sessionError }) => {
      if (sessionError) {
        setError(sessionError.message);
        setLoading(false);
        return;
      }

      setSession(data.session);
      if (!data.session) {
        setLoading(false);
      }
    });

    const { data: listener } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [client]);

  useEffect(() => {
    if (!client || !organizationId || !session) {
      if (!session) {
        setLoading(false);
      }
      return;
    }

    client
      .from("subscriptions")
      .select("plan_code, status, seats")
      .eq("organization_id", organizationId)
      .maybeSingle()
      .then(({ data, error: nextError }) => {
        if (nextError) {
          setError(nextError.message);
        } else {
          setSubscription(data);
        }
        setLoading(false);
      });
  }, [client, organizationId, session]);

  async function callBillingFunction(path: string, body: Record<string, string>) {
    if (!session) {
      throw new Error("Missing authenticated session.");
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error ?? "Billing request failed.");
    }

    return payload;
  }

  async function handleCheckout() {
    try {
      if (!priceId) {
        throw new Error("Set NEXT_PUBLIC_STRIPE_PRICE_ID before checkout.");
      }

      const payload = await callBillingFunction("billing-checkout", {
        organization_id: organizationId,
        price_id: priceId,
      });

      if (payload.checkout_url) {
        window.location.href = payload.checkout_url;
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unexpected billing error");
    }
  }

  async function handlePortal() {
    try {
      const payload = await callBillingFunction("billing-portal", {
        organization_id: organizationId,
      });

      if (payload.portal_url) {
        window.location.href = payload.portal_url;
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unexpected billing error");
    }
  }

  if (!session && !loading) {
    return (
      <div className="min-h-screen lg:flex">
        <Sidebar />
        <main className="flex-1 p-6 md:p-10">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <p className="text-sm uppercase tracking-[0.25em] text-[var(--accent)]">
              Authentication required
            </p>
            <h1 className="mt-4 text-4xl font-semibold text-white">
              Sign in to access billing.
            </h1>
            <Link
              href="/login"
              className="mt-6 inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#2dd4bf]"
            >
              Open login
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10">
        <div className="rounded-[2rem] border border-white/10 bg-[var(--panel)] p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            Billing
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-white">
            Live Stripe billing
          </h1>

          {error ? (
            <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-red-100">
              {error}
            </div>
          ) : null}

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-[var(--muted)]">Current plan</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {loading ? "Loading..." : subscription?.plan_code ?? "free"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/75">
                Status: {subscription?.status ?? "not started"} | Seats: {subscription?.seats ?? 1}
              </p>
            </article>
            <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-[var(--muted)]">Actions</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button onClick={() => void handleCheckout()} className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#2dd4bf]">
                  Start checkout
                </button>
                <button onClick={() => void handlePortal()} className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5">
                  Open portal
                </button>
              </div>
            </article>
          </div>
        </div>
      </main>
    </div>
  );
}
