import { Sidebar } from "@/components/sidebar";
import { reports } from "@/lib/mock-data";

export default function ReportsPage() {
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10">
        <div className="rounded-[2rem] border border-white/10 bg-[var(--panel)] p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            Reports
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-white">
            Monitor utilization, approval speed, and revenue.
          </h1>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {reports.map((report) => (
              <article
                key={report.label}
                className="rounded-3xl border border-white/10 bg-white/5 p-5"
              >
                <p className="text-sm text-[var(--muted)]">{report.label}</p>
                <p className="mt-3 text-3xl font-semibold text-white">{report.value}</p>
              </article>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
