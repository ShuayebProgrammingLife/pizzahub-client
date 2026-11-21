/* eslint-disable @next/next/no-img-element */
import { CalendarDays, Check, Loader2, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { fmtDate, fmtDeliveryDate, money } from "@/lib/format";
import type { VendorOrder } from "@/lib/types";

export function OrderCard({
  order,
  busy,
  onAct,
}: {
  order: VendorOrder;
  busy: boolean;
  onAct: (id: string, status: "accepted" | "rejected") => void;
}) {
  const name = order.customer?.name || "Customer";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <article className="flex h-full flex-col gap-4 rounded-lg border border-white/5 bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded bg-surface-high px-2 py-1 text-[10px] font-bold tracking-wider tabular">
          #ORD-{order._id.slice(-6).toUpperCase()}
        </span>
        <StatusBadge status={order.status} />
      </div>

      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-high text-sm font-bold text-ember">
          {initials}
        </span>
        <div className="min-w-0">
          <p className="truncate font-bold">{name}</p>
          <p className="truncate text-xs text-on-surface-variant">
            {order.customer?.email}
          </p>
        </div>
        <span className="ml-auto shrink-0 text-xs text-muted-foreground">
          {fmtDate(order.createdAt)}
        </span>
      </div>

      <div className="flex items-center gap-3 rounded-lg bg-surface-lowest p-3">
        {order.item?.image ? (
          <img
            src={order.item.image}
            alt=""
            className="h-12 w-12 shrink-0 rounded-md object-cover"
          />
        ) : (
          <span className="h-12 w-12 shrink-0 rounded-md bg-surface-high" />
        )}
        <p className="min-w-0 flex-1 truncate text-sm font-semibold">
          {order.item?.itemName ?? "Deleted item"}
        </p>
        <span className="tabular text-sm font-bold text-ember">
          {money(order.priceAtOrder)}
        </span>
      </div>

      <div className="space-y-2 text-sm text-on-surface-variant">
        <p className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 shrink-0 text-primary" /> Deliver on{" "}
          {fmtDeliveryDate(order.deliveryDate)}
        </p>
        <p className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{" "}
          {order.deliveryAddress}
        </p>
        {order.message && (
          <p className="rounded bg-surface-lowest px-3 py-2 text-xs italic">
            &ldquo;{order.message}&rdquo;
          </p>
        )}
      </div>

      {order.status === "pending" && (
        <div className="mt-auto grid grid-cols-2 gap-3 pt-1">
          <Button
            disabled={busy}
            onClick={() => onAct(order._id, "accepted")}
            className="bg-basil font-bold text-[#08390a] hover:bg-basil/90"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}{" "}
            Accept
          </Button>
          <Button
            disabled={busy}
            onClick={() => onAct(order._id, "rejected")}
            className="bg-tomato-container font-bold text-white hover:bg-tomato"
          >
            <X className="h-4 w-4" /> Reject
          </Button>
        </div>
      )}
    </article>
  );
}
