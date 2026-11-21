"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { toast } from "sonner";
import {
  Check,
  ChevronDown,
  Eye,
  Loader2,
  PackageSearch,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Pagination } from "@/components/dashboard/pagination";
import { useAdminList } from "@/lib/use-admin-list";
import { useDebounced } from "@/lib/use-debounced";
import { apiFetch } from "@/lib/api";
import { CATEGORIES } from "@/lib/constants";
import { fmtDate, money } from "@/lib/format";
import type { AdminItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type Res = {
  items: AdminItem[];
  counts: Record<string, number>;
  total: number;
  page: number;
  pages: number;
  limit: number;
};

const TABS = ["all", "pending", "approved", "rejected", "inactive"] as const;
const ACTIONS: Record<string, string> = {
  approved: "Approve",
  rejected: "Reject",
  inactive: "Mark inactive",
  pending: "Move to pending",
};
const DONE: Record<string, string> = {
  approved: "Item approved",
  rejected: "Item rejected",
  inactive: "Item set to inactive",
  pending: "Item moved back to pending",
};

function ItemViewDialog({
  item,
  busy,
  onClose,
  onStatus,
}: {
  item: AdminItem | null;
  busy: boolean;
  onClose: () => void;
  onStatus: (item: AdminItem, status: string) => void;
}) {
  return (
    <Dialog open={!!item} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        {item && (
          <ItemViewBody
            key={item._id}
            item={item}
            busy={busy}
            onStatus={onStatus}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ItemViewBody({
  item,
  busy,
  onStatus,
}: {
  item: AdminItem;
  busy: boolean;
  onStatus: (item: AdminItem, status: string) => void;
}) {
  const [active, setActive] = useState(0);
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex flex-wrap items-center gap-3 text-2xl">
          {item.itemName} <StatusBadge status={item.status} />
        </DialogTitle>
        <DialogDescription>
          {item.category} · {item.location}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3">
        <div className="aspect-[16/10] overflow-hidden rounded-lg bg-surface-high">
          <img
            src={item.images[active]}
            alt={item.itemName}
            className="h-full w-full object-cover"
          />
        </div>
        {item.images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {item.images.map((src, i) => (
              <button
                key={src + i}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "aspect-square overflow-hidden rounded-md border-2",
                  i === active
                    ? "border-primary"
                    : "border-transparent opacity-70",
                )}
                aria-label={`Show image ${i + 1}`}
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="whitespace-pre-line text-sm leading-relaxed text-on-surface-variant">
        {item.description}
      </p>

      <dl className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Price
          </dt>
          <dd className="tabular font-bold text-ember">{money(item.price)}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Submitted
          </dt>
          <dd>{fmtDate(item.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Vendor
          </dt>
          <dd>{item.vendor?.name ?? "Unknown"}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Vendor email
          </dt>
          <dd className="truncate">{item.vendor?.email ?? "—"}</dd>
        </div>
      </dl>

      {item.status === "pending" && (
        <DialogFooter className="gap-2">
          <Button
            disabled={busy}
            onClick={() => onStatus(item, "rejected")}
            className="bg-tomato-container font-bold text-white hover:bg-tomato"
          >
            <X className="h-4 w-4" /> Reject
          </Button>
          <Button
            disabled={busy}
            onClick={() => onStatus(item, "approved")}
            className="bg-basil font-bold text-[#08390a] hover:bg-basil/90"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}{" "}
            Approve
          </Button>
        </DialogFooter>
      )}
    </>
  );
}

export default function ManageItemsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<(typeof TABS)[number]>("all");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const q = useDebounced(search);

  const { data, error, loading, reload } = useAdminList<Res>(
    "/api/admin/items",
    {
      search: q,
      status: status === "all" ? "" : status,
      category: category === "all" ? "" : category,
      page,
    },
  );

  const [viewing, setViewing] = useState<AdminItem | null>(null);
  const [deleting, setDeleting] = useState<AdminItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function setItemStatus(item: AdminItem, next: string) {
    setBusyId(item._id);
    try {
      await apiFetch(`/api/admin/items/${item._id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      toast.success(DONE[next] ?? "Status updated");
      setViewing(null);
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update the item");
    } finally {
      setBusyId(null);
    }
  }

  async function removeItem() {
    if (!deleting) return;
    setBusyId(deleting._id);
    try {
      const r = await apiFetch<{ ordersClosed: number }>(
        `/api/admin/items/${deleting._id}`,
        { method: "DELETE" },
      );
      toast.success(
        r.ordersClosed > 0
          ? `Item deleted. ${r.ordersClosed} pending order(s) were closed.`
          : "Item deleted",
      );
      setDeleting(null);
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete the item");
    } finally {
      setBusyId(null);
    }
  }

  const categoryLabel = category === "all" ? "All categories" : category;

  return (
    <>
      <PageHeader
        eyebrow="Moderation"
        title="Manage Menu Items"
        subtitle="Review submissions. Only approved items are visible on the public menu."
      />

      <div className="grid gap-3 rounded-lg border border-white/5 bg-card p-3 md:grid-cols-[1fr_260px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by item, restaurant or location..."
            className="h-11 pl-10"
          />
        </div>
        <Select
          value={category}
          onValueChange={(v: string | null) => {
            setCategory(v ?? "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="h-11 w-full">
            <SelectValue>{categoryLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
            {t} ({data?.counts?.[t] ?? 0})
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
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : data.items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-12 text-center">
          <PackageSearch className="h-10 w-10 text-primary" />
          <p className="font-bold">No items match these filters</p>
          {status !== "all" && (
            <Button variant="secondary" onClick={() => setStatus("all")}>
              Show all items
            </Button>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "space-y-4 transition-opacity",
            loading && "opacity-60",
          )}
        >
          <p className="text-sm text-on-surface-variant">
            {data.total} {data.total === 1 ? "item" : "items"} found
          </p>
          <div className="overflow-x-auto rounded-lg border border-white/5 bg-card">
            <table className="w-full min-w-[1100px] text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <th className="p-4">Item</th>
                  <th className="p-4">Vendor</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Submitted</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => {
                  const busy = busyId === item._id;
                  return (
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
                            <p className="truncate font-bold">
                              {item.itemName}
                            </p>
                            <p className="truncate text-xs text-on-surface-variant">
                              {item.location}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="truncate font-semibold">
                          {item.vendor?.name ?? "Unknown"}
                        </p>
                        <p className="truncate text-xs text-on-surface-variant">
                          {item.vendor?.email}
                        </p>
                      </td>
                      <td className="p-4 text-on-surface-variant">
                        {item.category}
                      </td>
                      <td className="tabular p-4 font-bold text-ember">
                        {money(item.price)}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="p-4 text-on-surface-variant">
                        {fmtDate(item.createdAt)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setViewing(item)}
                            aria-label="View item"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {item.status === "pending" ? (
                            <>
                              <Button
                                size="sm"
                                disabled={busy}
                                onClick={() => setItemStatus(item, "approved")}
                                className="gap-1 bg-basil font-bold text-[#08390a] hover:bg-basil/90"
                              >
                                {busy ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Check className="h-3.5 w-3.5" />
                                )}{" "}
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                disabled={busy}
                                onClick={() => setItemStatus(item, "rejected")}
                                className="gap-1 bg-tomato-container font-bold text-white hover:bg-tomato"
                              >
                                <X className="h-3.5 w-3.5" /> Reject
                              </Button>
                            </>
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                disabled={busy}
                                className={cn(
                                  buttonVariants({
                                    variant: "secondary",
                                    size: "sm",
                                  }),
                                  "gap-1",
                                )}
                              >
                                {busy ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : null}{" "}
                                Change status
                                <ChevronDown className="h-3 w-3" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {Object.keys(ACTIONS)
                                  .filter((s) => s !== item.status)
                                  .map((s) => (
                                    <DropdownMenuItem
                                      key={s}
                                      onClick={() => setItemStatus(item, s)}
                                      className="cursor-pointer"
                                    >
                                      {ACTIONS[s]}
                                    </DropdownMenuItem>
                                  ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeleting(item)}
                            aria-label="Delete item"
                            className="text-secondary"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} pages={data.pages} onChange={setPage} />
        </div>
      )}

      <ItemViewDialog
        item={viewing}
        busy={!!viewing && busyId === viewing._id}
        onClose={() => setViewing(null)}
        onStatus={setItemStatus}
      />

      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this item?</DialogTitle>
            <DialogDescription>
              {deleting?.itemName} will be removed permanently. Any pending
              orders for it will be closed as rejected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="secondary" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              disabled={!!busyId}
              onClick={removeItem}
              className="bg-tomato-container font-bold text-white hover:bg-tomato"
            >
              {busyId ? (
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
