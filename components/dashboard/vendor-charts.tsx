"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { Inbox } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusChart } from "@/components/dashboard/status-chart";
import { apiFetch } from "@/lib/api";
import { money } from "@/lib/format";

type Analytics = {
  byStatus: {
    pending: number;
    accepted: number;
    rejected: number;
    cancelled: number;
  };
  days: { date: string; orders: number }[];
  topItems: {
    _id: string;
    name?: string;
    image?: string | null;
    orders: number;
    value: number;
  }[];
};

const dayLabel = (d: string) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "short",
    timeZone: "UTC",
  });

export function VendorCharts() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    apiFetch<Analytics>("/api/vendor/analytics")
      .then((d) => alive && setData(d))
      .catch(
        (e: unknown) =>
          alive &&
          setError(e instanceof Error ? e.message : "Could not load charts"),
      );
    return () => {
      alive = false;
    };
  }, []);

  if (error)
    return (
      <p className="rounded-lg border border-border bg-card p-4 text-sm text-danger">
        {error}
      </p>
    );

  const total = data
    ? Object.values(data.byStatus).reduce((a, b) => a + b, 0)
    : 0;
  const empty = (
    <div className="flex h-64 flex-col items-center justify-center gap-2 text-center text-on-surface-variant">
      <Inbox className="h-9 w-9 text-primary" />
      <p>No orders yet, so there is nothing to chart.</p>
    </div>
  );

  return (
    <section className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-white/5 bg-card p-5">
          <h2 className="mb-4 text-xl font-bold">Orders by status</h2>
          {!data ? (
            <Skeleton className="h-64 w-full" />
          ) : total === 0 ? (
            empty
          ) : (
            <StatusChart
              data={[
                {
                  name: "Pending",
                  value: data.byStatus.pending,
                  color: "#ffa000",
                },
                {
                  name: "Accepted",
                  value: data.byStatus.accepted,
                  color: "#4e9a4a",
                },
                {
                  name: "Rejected",
                  value: data.byStatus.rejected,
                  color: "#d32f2f",
                },
                {
                  name: "Cancelled",
                  value: data.byStatus.cancelled,
                  color: "#a18d79",
                },
              ]}
            />
          )}
        </div>

        <div className="rounded-lg border border-white/5 bg-card p-5">
          <h2 className="mb-4 text-xl font-bold">Orders in the last 7 days</h2>
          {!data ? (
            <Skeleton className="h-64 w-full" />
          ) : total === 0 ? (
            empty
          ) : (
            <StatusChart
              data={data.days.map((d) => ({
                name: dayLabel(d.date),
                value: d.orders,
                color: "#ffa000",
              }))}
            />
          )}
        </div>
      </div>

      {data && data.topItems.length > 0 && (
        <div className="rounded-lg border border-white/5 bg-card p-5">
          <h2 className="mb-4 text-xl font-bold">Top ordered items</h2>
          <ul className="space-y-3">
            {data.topItems.map((t) => (
              <li
                key={t._id}
                className="flex items-center gap-3 rounded-lg bg-surface-lowest p-3"
              >
                {t.image ? (
                  <img
                    src={t.image}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <span className="h-12 w-12 shrink-0 rounded-md bg-surface-high" />
                )}
                <p className="min-w-0 flex-1 truncate font-semibold">
                  {t.name ?? "Deleted item"}
                </p>
                <span className="text-sm text-on-surface-variant">
                  {t.orders} {t.orders === 1 ? "order" : "orders"}
                </span>
                <span className="tabular w-20 text-right font-bold text-ember">
                  {money(t.value)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
