"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Loader2,
  Pencil,
  PlusCircle,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ItemForm, type ItemPayload } from "@/components/dashboard/item-form";
import { apiFetch } from "@/lib/api";
import { fmtDate, money } from "@/lib/format";
import type { VendorItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type Res = { items: VendorItem[]; activeCount: number; limit: number | null };
const FILTERS = ["all", "approved", "pending", "rejected"] as const;

export default function MyItemsPage() {
  const [data, setData] = useState<Res | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [editing, setEditing] = useState<VendorItem | null>(null);
  const [deleting, setDeleting] = useState<VendorItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const reload = () => setTick((t) => t + 1);

  useEffect(() => {
    let alive = true;
    apiFetch<Res>("/api/items/mine")
      .then((d) => alive && (setData(d), setError("")))
      .catch(
        (e: unknown) =>
          alive &&
          setError(
            e instanceof Error ? e.message : "Could not load your items",
          ),
      );
    return () => {
      alive = false;
    };
  }, [tick]);

  const items = data?.items ?? [];
  const shown =
    filter === "all" ? items : items.filter((i) => i.status === filter);
  const count = (f: string) =>
    f === "all" ? items.length : items.filter((i) => i.status === f).length;

  async function toggle(item: VendorItem) {
    const next = item.isAvailable === false; // currently unavailable -> make available
    setTogglingId(item._id);
    try {
      await apiFetch(`/api/items/${item._id}/availability`, {
        method: "PATCH",
        body: JSON.stringify({ isAvailable: next }),
      });
      toast.success(next ? "Item is now available" : "Item marked unavailable");
      reload();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not update availability",
      );
    } finally {
      setTogglingId(null);
    }
  }

  async function remove() {
    if (!deleting) return;
    setBusy(true);
    try {
      await apiFetch(`/api/items/${deleting._id}`, { method: "DELETE" });
      toast.success("Item deleted");
      setDeleting(null);
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete the item");
    } finally {
      setBusy(false);
    }
  }

  async function save(payload: ItemPayload) {
    if (!editing) return;
    await apiFetch(`/api/items/${editing._id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    toast.success("Item updated");
    setEditing(null);
    reload();
  }

  const quotaText = data
    ? data.limit === null
      ? "Unlimited (Premium)"
      : `${data.activeCount} of ${data.limit} active slots used`
    : "";

  return (
    <>
      <PageHeader
        eyebrow="Menu"
        title="My Menu Items"
        subtitle="Approval status and availability for everything you have published."
        action={
          <Link
            href="/dashboard/vendor/add"
            className={cn(buttonVariants(), "gap-2 font-bold")}
          >
            <PlusCircle className="h-4 w-4" /> Add item
          </Link>
        }
      />

      {data && (
        <div className="space-y-2 rounded-lg border border-white/5 bg-card p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">{quotaText}</span>
            <Link
              href="/dashboard/vendor/subscription"
              className="text-primary hover:underline"
            >
              Plan
            </Link>
          </div>
          {data.limit !== null && (
            <div className="h-2 overflow-hidden rounded-full bg-surface-high">
              <div
                className="h-full rounded-full bg-primary"
                style={{
                  width: `${Math.min(100, (data.activeCount / data.limit) * 100)}%`,
                }}
              />
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold capitalize transition",
              filter === f
                ? "border-primary bg-primary text-primary-foreground"
                : "border-white/10 bg-surface-high text-on-surface-variant hover:text-foreground",
            )}
          >
            {f} ({count(f)})
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
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-12 text-center">
          <UtensilsCrossed className="h-10 w-10 text-primary" />
          <p className="font-bold">
            {items.length === 0
              ? "You have not added any items yet"
              : "No items in this view"}
          </p>
          {items.length === 0 && (
            <Link
              href="/dashboard/vendor/add"
              className={cn(buttonVariants(), "font-bold")}
            >
              Add your first pizza
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-white/5 bg-card">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="p-4">Item</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Created</th>
                <th className="p-4">Approval</th>
                <th className="p-4">Available</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((item) => (
                <tr
                  key={item._id}
                  className="border-b border-white/5 last:border-0"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.images[0]}
                        alt=""
                        className="h-12 w-12 shrink-0 rounded-md object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-bold">{item.itemName}</p>
                        <p className="truncate text-xs text-on-surface-variant">
                          {item.location}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-on-surface-variant">
                    {item.category}
                  </td>
                  <td className="tabular p-4 font-bold text-ember">
                    {money(item.price)}
                  </td>
                  <td className="p-4 text-on-surface-variant">
                    {fmtDate(item.createdAt)}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="p-4">
                    <Switch
                      checked={item.isAvailable !== false}
                      disabled={togglingId === item._id}
                      onCheckedChange={() => toggle(item)}
                      aria-label="Toggle availability"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditing(item)}
                        aria-label="Edit item"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeleting(item)}
                        aria-label="Delete item"
                        className="text-danger"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Rejected items are never shown to customers.
      </p>

      {/* Edit */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit menu item</DialogTitle>
            <DialogDescription>
              Update the details of your pizza.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <ItemForm
              key={editing._id}
              initial={editing}
              submitLabel="Save Changes"
              onSubmit={save}
              notice={
                editing.status !== "pending" && (
                  <p className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-ember">
                    Saving changes sends this item back to Pending for admin
                    review.
                  </p>
                )
              }
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this item?</DialogTitle>
            <DialogDescription>
              {deleting?.itemName} will be removed permanently. This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="secondary" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              disabled={busy}
              onClick={remove}
              className="bg-tomato-container font-bold text-white hover:bg-tomato"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}{" "}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
