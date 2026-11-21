"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Inbox,
  ShoppingBag,
  Timer,
  XCircle,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { StatusChart } from "@/components/dashboard/status-chart";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";
import { useCustomerOrders } from "@/lib/use-customer-orders";
import { fmtDeliveryDate, money } from "@/lib/format";
import type { CustomerSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function CustomerOverviewPage() {
  const { data: session } = authClient.useSession();
  const [s, setS] = useState<CustomerSummary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    apiFetch<CustomerSummary>("/api/orders/mine/summary")
      .then((d) => alive && setS(d))
      .catch(
        (e: unknown) =>
          alive &&
          setError(
            e instanceof Error ? e.message : "Could not load your summary",
          ),
      );
    return () => {
      alive = false;
    };
  }, []);

  const {
    orders,
    error: ordersError,
    reload,
  } = useCustomerOrders({ limit: 4 });

  const chart = s
    ? [
        { name: "Pending", value: s.pending, color: "#ffa000" },
        { name: "Accepted", value: s.accepted, color: "#aadf9e" },
        { name: "Rejected", value: s.rejected, color: "#d32f2f" },
        { name: "Cancelled", value: s.cancelled, color: "#a18d79" },
      ]
    : [];

  return (
    <>
      <PageHeader
        eyebrow="Customer dashboard"
        title={session?.user.name ? `Welcome, ${session.user.name}` : "Welcome"}
        subtitle="Track your pizza orders and see what the restaurants have decided."
        action={
          <Link
            href="/menu"
            className={cn(
              buttonVariants({ size: "lg" }),
              "gap-2 font-bold glow-amber",
            )}
          >
            <ShoppingBag className="h-4 w-4" /> Browse Menu
          </Link>
        }
      />

      {error && (
        <p className="rounded-lg border border-border bg-card p-4 text-sm text-secondary">
          {error}
        </p>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          loading={!s}
          icon={ShoppingBag}
          label="Total orders"
          value={s?.total ?? 0}
          hint={s ? `${s.cancelled} cancelled` : undefined}
        />
        <StatCard
          loading={!s}
          icon={Timer}
          label="Pending"
          value={s?.pending ?? 0}
          hint="Waiting for the restaurant"
        />
        <StatCard
          loading={!s}
          icon={CheckCircle2}
          label="Accepted"
          value={s?.accepted ?? 0}
          hint="Confirmed by the restaurant"
        />
        <StatCard
          loading={!s}
          icon={XCircle}
          label="Rejected"
          value={s?.rejected ?? 0}
          hint="Declined by the restaurant"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-white/5 bg-card p-5">
          <h2 className="mb-4 text-xl font-bold">Orders by status</h2>
          {!s ? (
            <Skeleton className="h-64 w-full" />
          ) : s.total === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-center text-on-surface-variant">
              <Inbox className="h-9 w-9 text-primary" />
              <p>No orders yet, so there is nothing to chart.</p>
            </div>
          ) : (
            <StatusChart data={chart} />
          )}
        </div>

        <div className="rounded-lg border border-white/5 bg-card p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold">Recent orders</h2>
            <Link
              href="/dashboard/customer/orders"
              className={cn(
                buttonVariants({ variant: "secondary", size: "sm" }),
                "gap-1.5",
              )}
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {ordersError ? (
            <div className="py-8 text-center">
              <p className="mb-4 text-on-surface-variant">{ordersError}</p>
              <Button onClick={reload}>Try again</Button>
            </div>
          ) : orders === null ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Inbox className="h-9 w-9 text-primary" />
              <p className="text-on-surface-variant">
                You have not ordered anything yet.
              </p>
              <Link href="/menu" className={cn(buttonVariants(), "font-bold")}>
                Explore the menu
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {orders.map((o) => (
                <li key={o._id}>
                  <Link
                    href="/dashboard/customer/orders"
                    className="flex items-center gap-3 rounded-lg bg-surface-lowest p-3 transition hover:bg-surface-high"
                  >
                    {o.item?.image ? (
                      <img
                        src={o.item.image}
                        alt=""
                        className="h-12 w-12 shrink-0 rounded-md object-cover"
                      />
                    ) : (
                      <span className="h-12 w-12 shrink-0 rounded-md bg-surface-high" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">
                        {o.item?.itemName ?? "Item no longer available"}
                      </p>
                      <p className="truncate text-xs text-on-surface-variant">
                        {fmtDeliveryDate(o.deliveryDate)} ·{" "}
                        <span className="tabular">{money(o.priceAtOrder)}</span>
                      </p>
                    </div>
                    <StatusBadge status={o.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
