import { Sidebar } from "@/components/sidebar";
import { approvalQueue } from "@/lib/mock-data";

export default function ApprovalsPage() {
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10">
        <div className="rounded-[2rem] border border-white/10 bg-[var(--panel)] p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            Approvals
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-white">
            Review submitted timesheets.
          </h1>
          <div className="mt-8 space-y-4">
            {approvalQueue.map((item) => (
              <article
                key={item.id}
                className="rounded-3xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-white">{item.contractor}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{item.project}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/80">
                      {item.hours}h
                    </span>
                    <button className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/5">
                      Reject
                    </button>
                    <button className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-[#2dd4bf]">
                      Approve
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
