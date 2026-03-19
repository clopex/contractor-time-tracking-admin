"use client";

import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { StatCard } from "@/components/stat-card";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type ProjectRow = {
  id: string;
  name: string;
  code: string | null;
  status: string;
  client: { name: string | null }[] | null;
  budget_cents?: number | null;
};

type SubmittedTimesheet = {
  id: string;
  user_id: string;
  status: string;
  full_name: string;
};

type SummaryPayload = {
  active_projects: number;
  submitted_timesheets: number;
  approved_timesheets: number;
  total_hours: number;
  billable_hours: number;
  project_breakdown: Array<{ id: string; name: string; hours: number }>;
};

const emptySummary: SummaryPayload = {
  active_projects: 0,
  submitted_timesheets: 0,
  approved_timesheets: 0,
  total_hours: 0,
  billable_hours: 0,
  project_breakdown: [],
};

export function DashboardHome() {
  const client = getSupabaseBrowserClient();
  const [session, setSession] = useState<Session | null>(null);
  const [summary, setSummary] = useState<SummaryPayload>(emptySummary);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [timesheets, setTimesheets] = useState<SubmittedTimesheet[]>([]);
  const [loading, setLoading] = useState(Boolean(client));
  const [error, setError] = useState<string | null>(client ? null : "Missing dashboard configuration.");
  const organizationId = process.env.NEXT_PUBLIC_DEFAULT_ORGANIZATION_ID ?? "";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

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
    if (!client || !session || !organizationId || !supabaseUrl) {
      if (!session) {
        setLoading(false);
      }
      return;
    }

    const currentClient = client;
    const currentSession = session;

    async function load() {
      try {
        const summaryResponse = await fetch(
          `${supabaseUrl}/functions/v1/reports-summary?organization_id=${organizationId}`,
          {
            headers: {
              Authorization: `Bearer ${currentSession.access_token}`,
            },
          },
        );

        const summaryPayload = await summaryResponse.json();
        if (!summaryResponse.ok) {
          throw new Error(summaryPayload.error ?? "Failed to load summary.");
        }

        const [projectResponse, timesheetResponse] = await Promise.all([
          currentClient
            .from("projects")
            .select("id, name, code, status, budget_cents, client:clients(name)")
            .eq("organization_id", organizationId)
            .order("created_at", { ascending: false })
            .limit(6),
          currentClient
            .from("timesheets")
            .select("id, user_id, status")
            .eq("organization_id", organizationId)
            .eq("status", "submitted")
            .order("submitted_at", { ascending: false })
            .limit(6),
        ]);

        if (projectResponse.error) {
          throw new Error(projectResponse.error.message);
        }

        if (timesheetResponse.error) {
          throw new Error(timesheetResponse.error.message);
        }

        const timesheetRows = (timesheetResponse.data ?? []) as Array<{ id: string; user_id: string; status: string }>;
        const userIds = timesheetRows.map((row) => row.user_id);
        const profileResponse = userIds.length > 0
          ? await currentClient.from("user_profiles").select("id, full_name").in("id", userIds)
          : { data: [], error: null };

        if (profileResponse.error) {
          throw new Error(profileResponse.error.message);
        }

        const profileRows = (profileResponse.data ?? []) as Array<{ id: string; full_name: string | null }>;
        const nameMap = new Map(profileRows.map((profile) => [profile.id, profile.full_name]));

        setSummary(summaryPayload as SummaryPayload);
        setProjects(projectResponse.data ?? []);
        setTimesheets(
          timesheetRows.map((row) => ({
            ...row,
            full_name: nameMap.get(row.user_id) ?? "Unknown user",
          })),
        );
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Unexpected dashboard error");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [client, organizationId, session, supabaseUrl]);

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
              Sign in to view live project data.
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

  const stats = [
    { label: "Hours this week", value: `${summary.total_hours}h`, trend: `${summary.billable_hours}h billable` },
    { label: "Pending approvals", value: `${summary.submitted_timesheets}`, trend: `${summary.approved_timesheets} approved` },
    { label: "Active projects", value: `${summary.active_projects}`, trend: `${projects.length} shown` },
    { label: "Authenticated as", value: session?.user.email ?? "User", trend: "Live session" },
  ];

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10">
        <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(37,99,235,0.12),rgba(20,184,166,0.06))] p-8 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
                Live overview
              </p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight text-white md:text-5xl">
                Keep projects profitable while approvals stay fast.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
                This dashboard now reads from your linked Supabase project instead of mock data.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/approvals" className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#2dd4bf]">
                Review approvals
              </Link>
              <Link href="/settings/billing" className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5">
                Billing
              </Link>
            </div>
          </div>
        </section>

        {error ? (
          <section className="mt-6 rounded-3xl border border-red-400/20 bg-red-500/10 p-6 text-red-100">
            {error}
          </section>
        ) : null}

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[2rem] border border-white/10 bg-[var(--panel)] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
                  Approval queue
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Submitted timesheets
                </h2>
              </div>
              <Link href="/approvals" className="text-sm font-semibold text-[var(--accent)]">
                Open board
              </Link>
            </div>

            <div className="mt-6 space-y-3">
              {loading ? (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-[var(--muted)]">
                  Loading timesheets...
                </div>
              ) : timesheets.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-[var(--muted)]">
                  No submitted timesheets yet.
                </div>
              ) : timesheets.map((item) => (
                <div key={item.id} className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{item.full_name}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">Status: {item.status}</p>
                  </div>
                  <span className="rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                    Review needed
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-[var(--panel)] p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
              Reporting pulse
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Live project breakdown
            </h2>

            <div className="mt-6 space-y-4">
              {summary.project_breakdown.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-[var(--panel-soft)] p-4 text-[var(--muted)]">
                  No project hours yet.
                </div>
              ) : summary.project_breakdown.map((project) => (
                <div key={project.id} className="rounded-3xl border border-white/10 bg-[var(--panel-soft)] p-4">
                  <p className="text-sm text-[var(--muted)]">{project.name}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{project.hours}h</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-[var(--panel)] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
                Active work
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Project portfolio
              </h2>
            </div>
            <Link href="/projects" className="text-sm font-semibold text-[var(--accent)]">
              View all
            </Link>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
            <table className="min-w-full divide-y divide-white/10 text-left">
              <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-4">Code</th>
                  <th className="px-4 py-4">Project</th>
                  <th className="px-4 py-4">Client</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Budget</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-[var(--panel)]">
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td className="px-4 py-4 font-mono text-sm text-[var(--accent)]">{project.code ?? "N/A"}</td>
                    <td className="px-4 py-4 text-white">{project.name}</td>
                    <td className="px-4 py-4 text-[var(--muted)]">{project.client?.[0]?.name ?? "Unassigned"}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/80">{project.status}</span>
                    </td>
                    <td className="px-4 py-4 text-white">
                      {project.budget_cents ? `$${(project.budget_cents / 100).toFixed(2)}` : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
