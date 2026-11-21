import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  pending: "bg-primary/15 text-primary",
  approved: "bg-basil/15 text-basil",
  accepted: "bg-basil/15 text-basil",
  paid: "bg-basil/15 text-basil",
  rejected: "bg-tomato/20 text-danger",
  failed: "bg-tomato/20 text-danger",
  cancelled: "bg-surface-highest text-on-surface-variant",
  inactive: "bg-surface-highest text-on-surface-variant",
  expired: "bg-surface-highest text-on-surface-variant",
};

export function StatusBadge({
  status,
  label,
}: {
  status: string;
  label?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
        STYLES[status] ?? STYLES.inactive,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label ?? status}
    </span>
  );
}
