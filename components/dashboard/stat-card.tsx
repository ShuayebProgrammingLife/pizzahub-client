import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function StatCard({
  label,
  value,
  suffix,
  hint,
  icon: Icon,
  badge,
  loading,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  hint?: string;
  icon: LucideIcon;
  badge?: string;
  loading?: boolean;
}) {
  return (
    <div className="flex h-full flex-col gap-3 rounded-lg border border-white/5 bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-high text-ember">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      {loading ? (
        <Skeleton className="h-10 w-24" />
      ) : (
        <p className="flex items-baseline gap-2 font-heading text-4xl font-extrabold tabular">
          {value}
          {suffix && (
            <span className="text-base font-semibold text-on-surface-variant">
              {suffix}
            </span>
          )}
        </p>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
        {badge && (
          <span className="rounded-full bg-tomato-container px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            {badge}
          </span>
        )}
        {hint && <span>{hint}</span>}
      </div>
    </div>
  );
}
