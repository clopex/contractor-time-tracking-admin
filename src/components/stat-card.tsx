type StatCardProps = {
  label: string;
  value: string;
  trend: string;
};

export function StatCard({ label, value, trend }: StatCardProps) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <p className="text-3xl font-semibold text-white">{value}</p>
        <span className="rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-1 text-xs font-semibold text-[var(--accent)]">
          {trend}
        </span>
      </div>
    </article>
  );
}
