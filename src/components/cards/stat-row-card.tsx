'use client';

export function StatRowCard({ data }: { data: Record<string, unknown> }) {
  const stats = (data.stats as Array<{ key: string; label: string; value: string }>) ?? [];
  return (
    <div className="flex items-center gap-4">
      {stats.map((s, i) => (
        <div key={i} className="flex items-baseline gap-1.5">
          <span className="text-[15px] font-semibold text-[var(--color-text-primary)] tabular-nums">{s.value}</span>
          <span className="text-[12px] text-[var(--color-text-tertiary)]">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
