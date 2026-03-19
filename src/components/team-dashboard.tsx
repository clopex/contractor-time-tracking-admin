"use client";

import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type MemberRow = {
  user_id: string;
  role: string;
  hourly_rate_cents: number;
  full_name: string;
  email: string;
  is_active: boolean;
};

type CreateMemberPayload = {
  member: {
    user_id: string;
    email: string;
    full_name: string;
    role: string;
    hourly_rate_cents: number;
  };
};

type FormState = {
  fullName: string;
  email: string;
  role: "owner" | "manager" | "contractor";
  hourlyRate: string;
  password: string;
};

const initialFormState: FormState = {
  fullName: "",
  email: "",
  role: "contractor",
  hourlyRate: "4000",
  password: "Password123!",
};

export function TeamDashboard() {
  const client = getSupabaseBrowserClient();
  const [session, setSession] = useState<Session | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(Boolean(client));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(client ? null : "Missing team configuration.");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);
  const [form, setForm] = useState<FormState>(initialFormState);
  const organizationId = process.env.NEXT_PUBLIC_DEFAULT_ORGANIZATION_ID ?? "";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

  const canCreate = useMemo(() => {
    return (
      form.fullName.trim().length > 1 &&
      form.email.trim().includes("@") &&
      form.password.trim().length >= 8
    );
  }, [form]);

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
    if (!client || !session || !organizationId) {
      if (!session) {
        setLoading(false);
      }
      return;
    }

    const currentClient = client;

    async function loadMembers() {
      try {
        const membershipResponse = await currentClient
          .from("memberships")
          .select("user_id, role, hourly_rate_cents, is_active")
          .eq("organization_id", organizationId)
          .is("deleted_at", null)
          .order("created_at", { ascending: true });

        if (membershipResponse.error) {
          throw new Error(membershipResponse.error.message);
        }

        const memberships = membershipResponse.data ?? [];
        const userIds = memberships.map((member) => member.user_id);
        const profileResponse = userIds.length > 0
          ? await currentClient.from("user_profiles").select("id, full_name, email").in("id", userIds)
          : { data: [], error: null };

        if (profileResponse.error) {
          throw new Error(profileResponse.error.message);
        }

        const profileMap = new Map(
          (profileResponse.data ?? []).map((profile) => [profile.id, profile]),
        );

        setMembers(
          memberships.map((member) => {
            const profile = profileMap.get(member.user_id);
            return {
              user_id: member.user_id,
              role: member.role,
              hourly_rate_cents: member.hourly_rate_cents ?? 0,
              full_name: profile?.full_name ?? "Unknown member",
              email: profile?.email ?? "No email",
              is_active: member.is_active ?? true,
            };
          }),
        );
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Unexpected team error");
      } finally {
        setLoading(false);
      }
    }

    void loadMembers();
  }, [client, organizationId, session]);

  async function reloadMembers() {
    if (!client || !session || !organizationId) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const membershipResponse = await client
        .from("memberships")
        .select("user_id, role, hourly_rate_cents, is_active")
        .eq("organization_id", organizationId)
        .is("deleted_at", null)
        .order("created_at", { ascending: true });

      if (membershipResponse.error) {
        throw new Error(membershipResponse.error.message);
      }

      const memberships = membershipResponse.data ?? [];
      const userIds = memberships.map((member) => member.user_id);
      const profileResponse = userIds.length > 0
        ? await client.from("user_profiles").select("id, full_name, email").in("id", userIds)
        : { data: [], error: null };

      if (profileResponse.error) {
        throw new Error(profileResponse.error.message);
      }

      const profileMap = new Map(
        (profileResponse.data ?? []).map((profile) => [profile.id, profile]),
      );

      setMembers(
        memberships.map((member) => {
          const profile = profileMap.get(member.user_id);
          return {
            user_id: member.user_id,
            role: member.role,
            hourly_rate_cents: member.hourly_rate_cents ?? 0,
            full_name: profile?.full_name ?? "Unknown member",
            email: profile?.email ?? "No email",
            is_active: member.is_active ?? true,
          };
        }),
      );
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unexpected team error");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setCreatedCredentials(null);

    if (!session) {
      setError("Missing authenticated session.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/invite-member`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          organization_id: organizationId,
          email: form.email.trim().toLowerCase(),
          full_name: form.fullName.trim(),
          role: form.role,
          hourly_rate_cents: Number.parseInt(form.hourlyRate, 10) || 0,
          password: form.password.trim(),
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to create member.");
      }

      const nextPayload = payload as CreateMemberPayload;
      setSuccessMessage(`Created ${nextPayload.member.full_name} as ${nextPayload.member.role}.`);
      setCreatedCredentials({
        email: nextPayload.member.email,
        password: form.password.trim(),
      });
      setForm({
        ...initialFormState,
        password: `Demo${Math.random().toString(36).slice(2, 8)}!`,
      });
      await reloadMembers();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unexpected team error");
    } finally {
      setSubmitting(false);
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
              Sign in to manage team accounts.
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
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
                Team
              </p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight text-white md:text-5xl">
                Create test users directly from the admin console.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
                This flow creates a live Supabase Auth account, user profile, and membership without activation email.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/80">
              Use dummy emails and a temporary password for demo accounts.
            </div>
          </div>

          {error ? (
            <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-red-100">
              {error}
            </div>
          ) : null}

          {successMessage ? (
            <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-emerald-100">
              <p>{successMessage}</p>
              {createdCredentials ? (
                <p className="mt-2 text-sm text-emerald-50/90">
                  Login: <span className="font-semibold">{createdCredentials.email}</span> / <span className="font-semibold">{createdCredentials.password}</span>
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm uppercase tracking-[0.25em] text-[var(--muted)]">
                Create member
              </p>
              <form className="mt-5 space-y-4" onSubmit={(event) => void handleCreateMember(event)}>
                <div>
                  <label className="text-sm font-medium text-white">Full name</label>
                  <input
                    value={form.fullName}
                    onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none transition focus:border-[var(--accent)]"
                    placeholder="Contractor Demo"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-white">Email</label>
                  <input
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none transition focus:border-[var(--accent)]"
                    placeholder="contractor@example.com"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-white">Role</label>
                    <select
                      value={form.role}
                      onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as FormState["role"] }))}
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none transition focus:border-[var(--accent)]"
                    >
                      <option value="contractor">Contractor</option>
                      <option value="manager">Manager</option>
                      <option value="owner">Owner</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white">Hourly rate (cents)</label>
                    <input
                      value={form.hourlyRate}
                      onChange={(event) => setForm((current) => ({ ...current, hourlyRate: event.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none transition focus:border-[var(--accent)]"
                      placeholder="4000"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-white">Temporary password</label>
                  <input
                    value={form.password}
                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none transition focus:border-[var(--accent)]"
                    placeholder="Password123!"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!canCreate || submitting}
                  className="inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#2dd4bf] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Creating member..." : "Create member"}
                </button>
              </form>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-[var(--muted)]">
                    Existing team
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    Workspace members
                  </h2>
                </div>
                <button
                  onClick={() => void reloadMembers()}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/5"
                >
                  Refresh
                </button>
              </div>

              <div className="mt-6 space-y-3">
                {loading ? (
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-[var(--muted)]">
                    Loading members...
                  </div>
                ) : members.length === 0 ? (
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-[var(--muted)]">
                    No members found for this organization yet.
                  </div>
                ) : members.map((member) => (
                  <article key={member.user_id} className="rounded-3xl border border-white/10 bg-slate-950/30 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-white">{member.full_name}</p>
                        <p className="mt-1 text-sm text-[var(--muted)]">{member.email}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full border border-white/10 px-3 py-1 text-white/80">
                          {member.role}
                        </span>
                        <span className="rounded-full border border-white/10 px-3 py-1 text-white/80">
                          {member.hourly_rate_cents} cents/hr
                        </span>
                        <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-emerald-100">
                          {member.is_active ? "active" : "inactive"}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
