"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Receipt,
  ShieldBan,
  Store,
  Timer,
  UserRound,
  Users,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusChart } from "@/components/dashboard/status-chart";
import { apiFetch } from "@/lib/api";
import { money } from "@/lib/format";
import type { AdminOverview } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function AdminOverviewPage() {
  const [ov, setOv] = useState<AdminOverview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    apiFetch<AdminOverview>("/api/admin/overview")
      .then((d) => alive && setOv(d))
      .catch(
        (e: unknown) =>
          alive &&
          setError(
            e instanceof Error ? e.message : "Could not load the overview",
          ),
      );
    return () => {
      alive = false;
    };
  }, []);

  const itemsChart = ov
    ? [
        { name: "Pending", value: ov.itemsByStatus.pending, color: "#ffa000" },
        {
          name: "Approved",
          value: ov.itemsByStatus.approved,
          color: "#aadf9e",
        },
        {
          name: "Rejected",
          value: ov.itemsByStatus.rejected,
          color: "#d32f2f",
        },
        {
          name: "Inactive",
          value: ov.itemsByStatus.inactive,
          color: "#a18d79",
        },
      ]
    : [];
  const usersChart = ov
    ? [
        { name: "Vendors", value: ov.vendors, color: "#ffa000" },
        { name: "Customers", value: ov.customers, color: "#aadf9e" },
        { name: "Admins", value: ov.admins, color: "#ffc788" },
      ]
    : [];

  return (
    <>
      <PageHeader
        eyebrow="Admin dashboard"
        title="Platform Overview"
        subtitle="Users, menu items and payments across PizzaHub."
      />

      {error && (
        <p className="rounded-lg border border-border bg-card p-4 text-sm text-secondary">
          {error}
        </p>
      )}

      {ov && ov.pendingItems > 0 && (
        <Link
          href="/dashboard/admin/items"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/40 bg-primary/10 p-4 transition hover:bg-primary/15"
        >
          <span className="font-semibold text-ember">
            {ov.pendingItems} menu{" "}
            {ov.pendingItems === 1 ? "item is" : "items are"} waiting for review
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-bold">
            Review now <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          loading={!ov}
          icon={Users}
          label="Registered users"
          value={ov?.totalUsers ?? 0}
          hint={ov ? `Includes ${ov.admins} admin` : undefined}
        />
        <StatCard
          loading={!ov}
          icon={Store}
          label="Vendors"
          value={ov?.vendors ?? 0}
          hint="Restaurant owners"
        />
        <StatCard
          loading={!ov}
          icon={UserRound}
          label="Customers"
          value={ov?.customers ?? 0}
          hint="Pizza lovers"
        />
        <StatCard
          loading={!ov}
          icon={ShieldBan}
          label="Blocked users"
          value={ov?.blockedUsers ?? 0}
          hint="Cannot use protected features"
        />
        <StatCard
          loading={!ov}
          icon={UtensilsCrossed}
          label="Total menu items"
          value={ov?.totalItems ?? 0}
          hint={
            ov ? `${ov.itemsByStatus.approved} live on the menu` : undefined
          }
        />
        <StatCard
          loading={!ov}
          icon={Timer}
          label="Pending menu items"
          value={ov?.pendingItems ?? 0}
          badge={ov && ov.pendingItems > 0 ? "Needs review" : undefined}
        />
        <StatCard
          loading={!ov}
          icon={Receipt}
          label="Transactions"
          value={ov?.totalTransactions ?? 0}
          hint="Subscription payments"
        />
        <StatCard
          loading={!ov}
          icon={Wallet}
          label="Paid revenue"
          value={money(ov?.revenue ?? 0)}
          hint="From verified payments"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-white/5 bg-card p-5">
          <h2 className="mb-4 text-xl font-bold">Menu items by status</h2>
          {!ov ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <StatusChart data={itemsChart} />
          )}
        </div>
        <div className="rounded-lg border border-white/5 bg-card p-5">
          <h2 className="mb-4 text-xl font-bold">Users by role</h2>
          {!ov ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <StatusChart data={usersChart} />
          )}
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-white/5 bg-card p-5">
        <p className="text-on-surface-variant">
          Jump straight to the tools you use most.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/admin/users"
            className={cn(buttonVariants({ variant: "secondary" }))}
          >
            Manage users
          </Link>
          <Link
            href="/dashboard/admin/items"
            className={cn(buttonVariants({ variant: "secondary" }))}
          >
            Manage menu items
          </Link>
          <Link
            href="/dashboard/admin/transactions"
            className={cn(buttonVariants({ variant: "secondary" }))}
          >
            Transactions
          </Link>
        </div>
      </section>
    </>
  );
}
