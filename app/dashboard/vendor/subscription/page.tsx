"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/dashboard/page-header";
import { apiFetch } from "@/lib/api";
import { fmtDate } from "@/lib/format";
import type { VendorOverview } from "@/lib/types";
import { cn } from "@/lib/utils";

const FREE = [
  "Max 3 active menu items",
  "Basic vendor dashboard",
  "Order management",
];
const PREMIUM = [
  "Unlimited active items",
  "Premium vendor badge",
  "Featured menu placement",
  "All Free features",
];

export default function SubscriptionPage() {
  const [ov, setOv] = useState<VendorOverview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    apiFetch<VendorOverview>("/api/vendor/overview")
      .then((d) => alive && setOv(d))
      .catch(
        (e: unknown) =>
          alive &&
          setError(e instanceof Error ? e.message : "Could not load your plan"),
      );
    return () => {
      alive = false;
    };
  }, []);

  const premium = ov?.plan === "premium";

  const plan = (
    title: string,
    features: string[],
    current: boolean,
    highlight?: boolean,
    action?: React.ReactNode,
  ) => (
    <div
      className={cn(
        "flex h-full flex-col gap-5 rounded-lg border bg-card p-6",
        highlight ? "border-primary/60 glow-amber" : "border-white/5",
      )}
    >
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          {highlight && <Crown className="h-5 w-5 text-primary" />} {title}
        </h2>
        {current && (
          <span className="rounded-full bg-basil/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-basil">
            Current plan
          </span>
        )}
      </div>
      <ul className="space-y-3 text-sm">
        {features.map((f) => (
          <li
            key={f}
            className="flex items-center gap-2 text-on-surface-variant"
          >
            <Check className="h-4 w-4 shrink-0 text-basil" /> {f}
          </li>
        ))}
      </ul>
      <div className="mt-auto">{action}</div>
    </div>
  );

  return (
    <>
      <PageHeader
        eyebrow="Billing"
        title="Subscription"
        subtitle="Go Premium to publish unlimited items and get featured placement."
      />

      {error && (
        <p className="rounded-lg border border-border bg-card p-4 text-sm text-secondary">
          {error}
        </p>
      )}

      {!ov && !error ? (
        <div className="grid gap-5 md:grid-cols-2">
          <Skeleton className="h-72 rounded-lg" />
          <Skeleton className="h-72 rounded-lg" />
        </div>
      ) : ov ? (
        <>
          <p className="text-sm text-on-surface-variant">
            {premium && ov.planExpiresAt
              ? `Your Premium plan is active until ${fmtDate(ov.planExpiresAt)}.`
              : `You are on the Free plan, using ${ov.activeItems} of ${ov.limit ?? "unlimited"} active items.`}
          </p>
          <div className="grid gap-5 md:grid-cols-2">
            {plan("Free", FREE, !premium)}
            {plan(
              "Premium",
              PREMIUM,
              premium,
              true,
              premium ? (
                <Button disabled className="h-11 w-full">
                  You are Premium
                </Button>
              ) : (
                <Button
                  className="h-11 w-full font-bold glow-amber"
                  onClick={() =>
                    toast.info("Stripe checkout is connected in the next step")
                  }
                >
                  Upgrade to Premium
                </Button>
              ),
            )}
          </div>
        </>
      ) : null}
    </>
  );
}
