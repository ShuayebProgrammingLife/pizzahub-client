"use client";
import { useState } from "react";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/dashboard/page-header";
import { OrderCard } from "@/components/dashboard/order-card";
import { useVendorOrders } from "@/lib/use-vendor-orders";
import { cn } from "@/lib/utils";

const TABS = ["all", "pending", "accepted", "rejected", "cancelled"] as const;

export default function VendorOrdersPage() {
  const { orders, error, busyId, act, reload } = useVendorOrders();
  const [tab, setTab] = useState<(typeof TABS)[number]>("all");

  const list = orders ?? [];
  const shown = tab === "all" ? list : list.filter((o) => o.status === tab);
  const count = (t: string) =>
    t === "all" ? list.length : list.filter((o) => o.status === t).length;

  return (
    <>
      <PageHeader
        eyebrow="Orders"
        title="Customer Orders"
        subtitle="Review each request. Only pending orders can be accepted or rejected, and only once."
      />

      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold capitalize transition",
              tab === t
                ? "border-primary bg-primary text-primary-foreground"
                : "border-white/10 bg-surface-high text-on-surface-variant hover:text-foreground",
            )}
          >
            {t} ({count(t)})
          </button>
        ))}
      </div>

      {error ? (
        <div className="rounded-lg border border-border bg-card p-10 text-center">
          <p className="mb-4 text-on-surface-variant">{error}</p>
          <Button onClick={reload}>Try again</Button>
        </div>
      ) : orders === null ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-72 rounded-lg" />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-12 text-center">
          <Inbox className="h-10 w-10 text-primary" />
          <p className="font-bold">No orders here yet</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {shown.map((o) => (
            <OrderCard
              key={o._id}
              order={o}
              busy={busyId === o._id}
              onAct={act}
            />
          ))}
        </div>
      )}
    </>
  );
}
