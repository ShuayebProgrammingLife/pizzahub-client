"use client";
import { useState } from "react";
import Link from "next/link";
import { Inbox, Loader2, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  CustomerOrderCard,
  OrderDetailsDialog,
} from "@/components/dashboard/customer-order-card";
import { useCustomerOrders } from "@/lib/use-customer-orders";
import type { CustomerOrder } from "@/lib/types";
import { cn } from "@/lib/utils";

const TABS = ["all", "pending", "accepted", "rejected", "cancelled"] as const;

export default function MyOrdersPage() {
  const { orders, error, busyId, cancel, reload } = useCustomerOrders();
  const [tab, setTab] = useState<(typeof TABS)[number]>("all");
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<CustomerOrder | null>(null);

  const list = orders ?? [];
  const shown = tab === "all" ? list : list.filter((o) => o.status === tab);
  const count = (t: string) =>
    t === "all" ? list.length : list.filter((o) => o.status === t).length;
  const viewing = list.find((o) => o._id === viewingId) ?? null;

  async function confirmCancel() {
    if (!cancelling) return;
    await cancel(cancelling._id);
    setCancelling(null); // on failure the hook reloads, so the card shows the real status
  }

  return (
    <>
      <PageHeader
        eyebrow="Orders"
        title="My Orders"
        subtitle="You can cancel an order only while it is still pending."
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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-72 rounded-lg" />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-12 text-center">
          <Inbox className="h-10 w-10 text-primary" />
          <p className="font-bold">
            {list.length === 0
              ? "You have not placed any orders yet"
              : "No orders in this view"}
          </p>
          {list.length === 0 && (
            <Link href="/menu" className={cn(buttonVariants(), "font-bold")}>
              Browse the menu
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((o) => (
            <CustomerOrderCard
              key={o._id}
              order={o}
              busy={busyId === o._id}
              onView={(x) => setViewingId(x._id)}
              onCancel={setCancelling}
            />
          ))}
        </div>
      )}

      <OrderDetailsDialog
        order={viewing}
        onClose={() => setViewingId(null)}
        onCancel={(o) => {
          setViewingId(null);
          setCancelling(o);
        }}
      />

      <Dialog
        open={!!cancelling}
        onOpenChange={(o) => !o && setCancelling(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel this order?</DialogTitle>
            <DialogDescription>
              {cancelling?.item?.itemName ?? "This order"} will be cancelled.
              You can place a new order any time.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="secondary" onClick={() => setCancelling(null)}>
              Keep order
            </Button>
            <Button
              disabled={!!busyId}
              onClick={confirmCancel}
              className="bg-tomato-container font-bold text-white hover:bg-tomato"
            >
              {busyId ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}{" "}
              Yes, cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
