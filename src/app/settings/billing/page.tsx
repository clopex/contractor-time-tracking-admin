import { Sidebar } from "@/components/sidebar";

export default function BillingPage() {
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10">
        <div className="rounded-[2rem] border border-white/10 bg-[var(--panel)] p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            Billing
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-white">
            Stripe billing shell
          </h1>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-[var(--muted)]">Current plan</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Starter</h2>
              <p className="mt-3 text-sm leading-6 text-white/75">
                3 seats, approvals, advanced reports, AI draft mode.
              </p>
            </article>
            <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-[var(--muted)]">Next step</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Customer portal</h2>
              <p className="mt-3 text-sm leading-6 text-white/75">
                Wire this page to Stripe checkout and portal session endpoints from the backend repo.
              </p>
            </article>
          </div>
        </div>
      </main>
    </div>
  );
}
