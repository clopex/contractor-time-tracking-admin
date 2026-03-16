import Link from "next/link";

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/projects", label: "Projects" },
  { href: "/approvals", label: "Approvals" },
  { href: "/reports", label: "Reports" },
  { href: "/settings/billing", label: "Billing" },
];

export function Sidebar() {
  return (
    <aside className="flex w-full max-w-72 flex-col border-r border-white/10 bg-[var(--panel)] p-6">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
          ContractorOS
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-white">
          Admin Console
        </h1>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-2xl border border-transparent px-4 py-3 text-sm font-medium text-[var(--muted)] transition hover:border-white/10 hover:bg-white/5 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto rounded-3xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 p-5">
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
          Live plan
        </p>
        <p className="mt-2 text-sm leading-6 text-white/80">
          Starter tier with 3 seats, approvals enabled, AI draft mode ready.
        </p>
      </div>
    </aside>
  );
}
