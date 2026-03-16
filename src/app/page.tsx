import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { StatCard } from "@/components/stat-card";
import { approvalQueue, dashboardStats, projects, reports } from "@/lib/mock-data";

export default function Home() {
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10">
        <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(37,99,235,0.12),rgba(20,184,166,0.06))] p-8 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
                Operations overview
              </p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight text-white md:text-5xl">
                Keep projects profitable while approvals stay fast.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
                This admin repo is wired for workspace setup, project tracking,
                billing state, and approval workflows against the Supabase backend.
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                href="/approvals"
                className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#2dd4bf]"
              >
                Review approvals
              </Link>
              <Link
                href="/projects"
                className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
              >
                Manage projects
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dashboardStats.map((stat) => (
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
                  Timesheets waiting on action
                </h2>
              </div>
              <Link href="/approvals" className="text-sm font-semibold text-[var(--accent)]">
                Open board
              </Link>
            </div>

            <div className="mt-6 space-y-3">
              {approvalQueue.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{item.contractor}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {item.project}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/80">
                      {item.hours}h
                    </span>
                    <span className="rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-[var(--panel)] p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
              Reporting pulse
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Performance snapshot
            </h2>

            <div className="mt-6 space-y-4">
              {reports.map((report) => (
                <div
                  key={report.label}
                  className="rounded-3xl border border-white/10 bg-[var(--panel-soft)] p-4"
                >
                  <p className="text-sm text-[var(--muted)]">{report.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{report.value}</p>
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
                  <tr key={project.code}>
                    <td className="px-4 py-4 font-mono text-sm text-[var(--accent)]">
                      {project.code}
                    </td>
                    <td className="px-4 py-4 text-white">{project.name}</td>
                    <td className="px-4 py-4 text-[var(--muted)]">{project.client}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/80">
                        {project.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-white">{project.budget}</td>
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
