/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { CalendarDays, Loader2, MapPin, Store, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { fmtDate, fmtDateTime, fmtDeliveryDate, money } from "@/lib/format";
import type { CustomerOrder } from "@/lib/types";
import { cn } from "@/lib/utils";

const orderRef = (o: CustomerOrder) => `#ORD-${o._id.slice(-6).toUpperCase()}`;

export function CustomerOrderCard({
  order,
  busy,
  onView,
  onCancel,
}: {
  order: CustomerOrder;
  busy: boolean;
  onView: (o: CustomerOrder) => void;
  onCancel: (o: CustomerOrder) => void;
}) {
  return (
    <article className="flex h-full flex-col gap-4 rounded-lg border border-white/5 bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded bg-surface-high px-2 py-1 text-[10px] font-bold tracking-wider tabular">
          {orderRef(order)}
        </span>
        <StatusBadge status={order.status} />
      </div>

      <div className="flex items-center gap-3 rounded-lg bg-surface-lowest p-3">
        {order.item?.image ? (
          <img
            src={order.item.image}
            alt=""
            className="h-14 w-14 shrink-0 rounded-md object-cover"
          />
        ) : (
          <span className="h-14 w-14 shrink-0 rounded-md bg-surface-high" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold">
            {order.item?.itemName ?? "Item no longer available"}
          </p>
          <p className="flex items-center gap-1.5 truncate text-xs text-on-surface-variant">
            <Store className="h-3 w-3 shrink-0" />{" "}
            {order.vendor?.name ?? "Restaurant"}
          </p>
        </div>
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
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span className="line-clamp-2">{order.deliveryAddress}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Requested on {fmtDate(order.createdAt)}
        </p>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-3 pt-1">
        <Button
          variant="secondary"
          onClick={() => onView(order)}
          className={cn(order.status !== "pending" && "col-span-2")}
        >
          View details
        </Button>
        {order.status === "pending" && (
          <Button
            disabled={busy}
            onClick={() => onCancel(order)}
            className="bg-tomato-container font-bold text-white hover:bg-tomato"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}{" "}
            Cancel
          </Button>
        )}
      </div>
    </article>
  );
}

function Timeline({ order }: { order: CustomerOrder }) {
  const steps: {
    label: string;
    at?: string;
    state: "done" | "current" | "bad";
  }[] = [{ label: "Order placed", at: order.createdAt, state: "done" }];
  if (order.status === "pending")
    steps.push({
      label: "Waiting for the restaurant to respond",
      state: "current",
    });
  if (order.status === "accepted")
    steps.push({
      label: "Accepted by the restaurant",
      at: order.respondedAt,
      state: "done",
    });
  if (order.status === "rejected")
    steps.push({
      label: "Rejected by the restaurant",
      at: order.respondedAt,
      state: "bad",
    });
  if (order.status === "cancelled")
    steps.push({
      label: "Cancelled by you",
      at: order.cancelledAt,
      state: "bad",
    });

  const dot = {
    done: "bg-basil",
    current: "bg-primary animate-pulse",
    bad: "bg-tomato",
  };

  return (
    <ol>
      {steps.map((s, i) => (
        <li key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className={cn("mt-1 h-3 w-3 rounded-full", dot[s.state])} />
            {i < steps.length - 1 && (
              <span className="w-px flex-1 bg-white/10" />
            )}
          </div>
          <div className="pb-4">
            <p className="text-sm font-semibold">{s.label}</p>
            {s.at && (
              <p className="text-xs text-muted-foreground">
                {fmtDateTime(s.at)}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function OrderDetailsDialog({
  order,
  onClose,
  onCancel,
}: {
  order: CustomerOrder | null;
  onClose: () => void;
  onCancel: (o: CustomerOrder) => void;
}) {
  return (
    <Dialog open={!!order} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {order && (
          <>
            <DialogHeader>
              <DialogTitle className="flex flex-wrap items-center gap-3 text-2xl">
                Order details <StatusBadge status={order.status} />
              </DialogTitle>
              <DialogDescription className="tabular">
                {orderRef(order)}
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-3 rounded-lg bg-surface-lowest p-3">
              {order.item?.image ? (
                <img
                  src={order.item.image}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-md object-cover"
                />
              ) : (
                <span className="h-16 w-16 shrink-0 rounded-md bg-surface-high" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">
                  {order.item?.itemName ?? "Item no longer available"}
                </p>
                <p className="truncate text-sm text-on-surface-variant">
                  {order.vendor?.name ?? "Restaurant"}
                  {order.item?.location ? ` · ${order.item.location}` : ""}
                </p>
              </div>
              <span className="tabular font-bold text-ember">
                {money(order.priceAtOrder)}
              </span>
            </div>

            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Delivery date
                </dt>
                <dd>{fmtDeliveryDate(order.deliveryDate)}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Delivery address
                </dt>
                <dd>{order.deliveryAddress}</dd>
              </div>
              {order.message && (
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Your instructions
                  </dt>
                  <dd className="italic text-on-surface-variant">
                    &ldquo;{order.message}&rdquo;
                  </dd>
                </div>
              )}
            </dl>

            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Status timeline
              </p>
              <Timeline order={order} />
            </div>

            <div className="flex flex-wrap gap-3">
              {order.item?._id && (
                <Link
                  href={`/menu/${order.item._id}`}
                  className={cn(buttonVariants({ variant: "secondary" }))}
                >
                  View item
                </Link>
              )}
              {order.status === "pending" && (
                <Button
                  onClick={() => onCancel(order)}
                  className="bg-tomato-container font-bold text-white hover:bg-tomato"
                >
                  <Trash2 className="h-4 w-4" /> Cancel order
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
