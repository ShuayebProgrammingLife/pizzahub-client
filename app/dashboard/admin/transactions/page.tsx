"use client";
import { useState } from "react";
import { Info, Receipt, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Pagination } from "@/components/dashboard/pagination";
import { useAdminList } from "@/lib/use-admin-list";
import { useDebounced } from "@/lib/use-debounced";
import { fmtDate, fmtMoney, money } from "@/lib/format";
import type { AdminTransaction } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Wallet } from "lucide-react";

type Res = {
  transactions: AdminTransaction[];
  paidRevenue: number;
  total: number;
  page: number;
  pages: number;
  limit: number;
};

const TABS = ["all", "paid", "pending", "failed", "expired"] as const;

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<(typeof TABS)[number]>("all");
  const [page, setPage] = useState(1);
  const q = useDebounced(search);

  const { data, error, loading, reload } = useAdminList<Res>(
    "/api/admin/transactions",
    {
      search: q,
      status: status === "all" ? "" : status,
      page,
    },
  );

  return (
    <>
      <PageHeader
        eyebrow="Payments"
        title="Transactions"
        subtitle="Vendor subscription payments recorded from verified Stripe events."
      />

      <p className="flex items-start gap-2 rounded-lg border border-border bg-surface-lowest p-3 text-sm text-on-surface-variant">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        Payment records are read-only. They can only be created by verified
        Stripe webhooks, so they cannot be edited here.
      </p>

      <section className="grid gap-4 sm:grid-cols-2">
        <StatCard
          loading={!data}
          icon={Receipt}
          label="Transactions (this view)"
          value={data?.total ?? 0}
        />
        <StatCard
          loading={!data}
          icon={Wallet}
          label="Paid revenue (this view)"
          value={money(data?.paidRevenue ?? 0)}
        />
      </section>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by vendor, email or Stripe session..."
          className="h-11 pl-10"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setStatus(t);
              setPage(1);
            }}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold capitalize transition",
              status === t
                ? "border-primary bg-primary text-primary-foreground"
                : "border-white/10 bg-surface-high text-on-surface-variant hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {error ? (
        <div className="rounded-lg border border-border bg-card p-10 text-center">
          <p className="mb-4 text-on-surface-variant">{error}</p>
          <Button onClick={reload}>Try again</Button>
        </div>
      ) : !data ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : data.transactions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-12 text-center">
          <Receipt className="h-10 w-10 text-primary" />
          <p className="font-bold">No transactions found</p>
          <p className="text-sm text-on-surface-variant">
            They appear here after vendors upgrade to Premium.
          </p>
        </div>
      ) : (
        <div
          className={cn(
            "space-y-4 transition-opacity",
            loading && "opacity-60",
          )}
        >
          <div className="overflow-x-auto rounded-lg border border-white/5 bg-card">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <th className="p-4">Vendor</th>
                  <th className="p-4">Plan</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Stripe session</th>
                </tr>
              </thead>
              <tbody>
                {data.transactions.map((t) => (
                  <tr
                    key={t._id}
                    className="border-b border-white/5 last:border-0"
                  >
                    <td className="p-4">
                      <p className="truncate font-bold">
                        {t.vendor?.name ?? "Unknown vendor"}
                      </p>
                      <p className="truncate text-xs text-on-surface-variant">
                        {t.vendor?.email}
                      </p>
                    </td>
                    <td className="p-4 capitalize">{t.plan}</td>
                    <td className="tabular p-4 font-bold text-ember">
                      {fmtMoney(t.amount, t.currency)}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="p-4 text-on-surface-variant">
                      {fmtDate(t.createdAt)}
                    </td>
                    <td className="p-4">
                      <span className="block max-w-[11rem] truncate font-mono text-xs text-muted-foreground">
                        {t.stripeSessionId ?? "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} pages={data.pages} onChange={setPage} />
        </div>
      )}
    </>
  );
}
