"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Crown, Inbox, Layers, PlusCircle, Timer, Wallet } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { OrderCard } from "@/components/dashboard/order-card";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";
import { useVendorOrders } from "@/lib/use-vendor-orders";
import { fmtDate, money } from "@/lib/format";
import { cn } from "@/lib/utils";

import { VendorCharts } from "@/components/dashboard/vendor-charts";

export default function VendorOverviewPage() {
  const { data: session } = authClient.useSession();
  const [ov, setOv] = useState(null);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    apiFetch("/api/vendor/overview")
      .then((d) => alive && setOv(d))
      .catch((e) => alive && setError(e instanceof Error ? e.message : "Could not load overview"));
    return () => {
      alive = false;
    };
  }, [tick]);

  const { orders, error: ordersError, busyId, act, reload } = useVendorOrders("pending", () => setTick((t) => t + 1));
  const name = session?.user.businessName || session?.user.name;

  return (
    <>
      <PageHeader
        eyebrow="Vendor dashboard"
        title={name ? `Welcome, ${name}` : "Welcome"}
        subtitle="Monitor your menu, customer orders and subscription at a glance."
        action={
          <Link
            href="/dashboard/vendor/add"
            className={cn(
              buttonVariants({ size: "lg" }),
              "gap-2 font-bold glow-amber",
            )}
          >
            <PlusCircle className="h-4 w-4" /> Create New Pizza Item
          </Link>
        }
      />

      {error && (
        <p className="rounded-lg border border-border bg-card p-4 text-sm text-secondary">
          {error}
        </p>
      )}

      {session?.user && !session.user.businessName && (
        <Link
          href="/dashboard/vendor/profile"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/40 bg-primary/10 p-4 text-sm font-semibold text-ember transition hover:bg-primary/15"
        >
          Add your restaurant name so customers see it on your pizzas
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          loading={!ov}
          icon={Layers}
          label="Total menu items"
          value={ov?.totalItems ?? 0}
          hint={ov ? `${ov.pendingItems} awaiting approval` : undefined}
        />
        <StatCard
          loading={!ov}
          icon={Crown}
          label="Active / quota"
          value={ov?.activeItems ?? 0}
          suffix={ov ? `/ ${ov.limit ?? "∞"}` : undefined}
          hint={
            ov
              ? ov.plan === "premium"
                ? "Premium plan: unlimited"
                : "Free plan limit"
              : undefined
          }
        />

        <StatCard
          loading={!ov}
          icon={Timer}
          label="Pending orders"
          value={ov?.pendingOrders ?? 0}
          badge={ov && ov.pendingOrders > 0 ? "Action required" : undefined}
        />
        <StatCard
          loading={!ov}
          icon={Wallet}
          label="Accepted orders"
          value={ov?.acceptedOrders ?? 0}
          hint={ov ? `${money(ov.acceptedRevenue)} accepted value` : undefined}
        />
      </section>

      <VendorCharts />

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">Pending Customer Orders</h2>
            <p className="text-sm text-on-surface-variant">
              Accept or reject each order once.
            </p>
          </div>
          <Link
            href="/dashboard/vendor/orders"
            className={cn(buttonVariants({ variant: "secondary" }), "gap-2")}
          >
            All orders <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {ordersError ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="mb-4 text-on-surface-variant">{ordersError}</p>
            <Button onClick={reload}>Try again</Button>
          </div>
        ) : orders === null ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-72 rounded-lg" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-10 text-center">
            <Inbox className="h-9 w-9 text-primary" />
            <p className="font-bold">No pending orders</p>
            <p className="text-sm text-on-surface-variant">
              New customer orders will show up here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {orders.slice(0, 4).map((o) => (
              <OrderCard
                key={o._id}
                order={o}
                busy={busyId === o._id}
                onAct={act}
              />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-white/5 bg-card p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-surface-high text-ember">
            <Crown className="h-5 w-5" />
          </span>
          <div>
            <p className="font-bold">
              Current plan:{" "}
              <span className="text-ember">
                {ov ? (ov.plan === "premium" ? "Premium" : "Free") : "..."}
              </span>
            </p>
            <p className="text-sm text-on-surface-variant">
              {ov?.plan === "premium" && ov.planExpiresAt
                ? `Active until ${fmtDate(ov.planExpiresAt)}`
                : "Free plan: up to 3 active menu items."}
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/vendor/subscription"
          className={cn(buttonVariants({ variant: "secondary" }))}
        >
          Manage subscription
        </Link>
      </section>
    </>
  );
}