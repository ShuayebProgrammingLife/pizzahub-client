"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Eye,
  Loader2,
  Search,
  ShieldBan,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { fmtDate } from "@/lib/format";
import type { AdminUser, AdminUserDetails } from "@/lib/types";
import { cn } from "@/lib/utils";

type Res = {
  users: AdminUser[];
  total: number;
  page: number;
  pages: number;
  limit: number;
};

const ROLES = ["all", "vendor", "customer", "admin"] as const;
const STATUSES = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "blocked", label: "Blocked" },
];
const STAT_LABELS: Record<string, string> = {
  menuItems: "Menu items",
  ordersReceived: "Orders received",
  transactions: "Transactions",
  ordersPlaced: "Orders placed",
};

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

function UserDetailsDialog({
  id,
  onClose,
}: {
  id: string | null;
  onClose: () => void;
}) {
  const [result, setResult] = useState<{
    id: string;
    data: AdminUserDetails | null;
    error: string;
  } | null>(null);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    apiFetch<AdminUserDetails>(`/api/admin/users/${id}`)
      .then(
        (data) =>
          alive && setResult({ id, data, error: "" }),
      )
      .catch(
        (e: unknown) =>
          alive &&
          setResult({
            id,
            data: null,
            error: e instanceof Error ? e.message : "Could not load details",
          }),
      );
    return () => {
      alive = false;
    };
  }, [id]);

  const d = result?.id === id ? result.data : null;
  const err = result?.id === id ? result.error : "";
  const u = d?.user;
  return (
    <Dialog open={!!id} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">User details</DialogTitle>
          <DialogDescription>
            Account information and activity.
          </DialogDescription>
        </DialogHeader>

        {err ? (
          <p className="text-sm text-secondary">{err}</p>
        ) : !u ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                {u.image && <AvatarImage src={u.image} alt={u.name} />}
                <AvatarFallback className="bg-primary font-bold text-primary-foreground">
                  {initialsOf(u.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-lg font-bold">{u.name}</p>
                <p className="truncate text-sm text-on-surface-variant">
                  {u.email}
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Role
                </dt>
                <dd className="capitalize">{u.role}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Status
                </dt>
                <dd>
                  <StatusBadge
                    status={u.isBlocked ? "rejected" : "approved"}
                    label={u.isBlocked ? "blocked" : "active"}
                  />
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Joined
                </dt>
                <dd>{fmtDate(u.createdAt)}</dd>
              </div>
              {u.role === "vendor" && (
                <>
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Restaurant
                    </dt>
                    <dd>{u.businessName || "Not set"}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Plan
                    </dt>
                    <dd>
                      {u.subscriptionPlan === "premium" ? "Premium" : "Free"}
                      {u.subscriptionPlan === "premium" &&
                      u.subscriptionExpiresAt
                        ? `, until ${fmtDate(u.subscriptionExpiresAt)}`
                        : ""}
                    </dd>
                  </div>
                </>
              )}
            </dl>

            {d && Object.keys(d.stats).length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(d.stats).map(([k, v]) => (
                  <div
                    key={k}
                    className="rounded-lg bg-surface-lowest p-3 text-center"
                  >
                    <p className="font-heading text-2xl font-extrabold tabular">
                      {v}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {STAT_LABELS[k] ?? k}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function ManageUsersPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<(typeof ROLES)[number]>("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const q = useDebounced(search);

  const { data, error, loading, reload } = useAdminList<Res>(
    "/api/admin/users",
    {
      search: q,
      role: role === "all" ? "" : role,
      status: status === "all" ? "" : status,
      page,
    },
  );

  const [viewId, setViewId] = useState<string | null>(null);
  const [target, setTarget] = useState<AdminUser | null>(null);
  const [busy, setBusy] = useState(false);

  async function confirmToggle() {
    if (!target) return;
    const next = !target.isBlocked;
    setBusy(true);
    try {
      await apiFetch(`/api/admin/users/${target._id}/block`, {
        method: "PATCH",
        body: JSON.stringify({ isBlocked: next }),
      });
      toast.success(next ? "User blocked" : "User unblocked");
      setTarget(null);
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update the user");
    } finally {
      setBusy(false);
    }
  }

  const statusLabel =
    STATUSES.find((s) => s.value === status)?.label ?? "All statuses";

  return (
    <>
      <PageHeader
        eyebrow="Users"
        title="Manage Users"
        subtitle="Search accounts, review their details and block or unblock them."
      />

      <div className="grid gap-3 rounded-lg border border-white/5 bg-card p-3 md:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or email..."
            className="h-11 pl-10"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v: string | null) => {
            setStatus(v ?? "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="h-11 w-full">
            <SelectValue>{statusLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {ROLES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => {
              setRole(r);
              setPage(1);
            }}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold capitalize transition",
              role === r
                ? "border-primary bg-primary text-primary-foreground"
                : "border-white/10 bg-surface-high text-on-surface-variant hover:text-foreground",
            )}
          >
            {r === "all" ? "All roles" : `${r}s`}
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
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : data.users.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-12 text-center">
          <Users className="h-10 w-10 text-primary" />
          <p className="font-bold">No users match your search</p>
          <p className="text-sm text-on-surface-variant">
            Try a different name, email or filter.
          </p>
        </div>
      ) : (
        <div
          className={cn(
            "space-y-4 transition-opacity",
            loading && "opacity-60",
          )}
        >
          <p className="text-sm text-on-surface-variant">
            {data.total} {data.total === 1 ? "user" : "users"} found
          </p>
          <div className="overflow-x-auto rounded-lg border border-white/5 bg-card">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Restaurant / plan</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((u) => (
                  <tr
                    key={u._id}
                    className="border-b border-white/5 last:border-0"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          {u.image && (
                            <AvatarImage src={u.image} alt={u.name} />
                          )}
                          <AvatarFallback className="bg-surface-high text-xs font-bold text-ember">
                            {initialsOf(u.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-bold">{u.name}</p>
                          <p className="truncate text-xs text-on-surface-variant">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="rounded bg-surface-high px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-ember">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-on-surface-variant">
                      {u.role === "vendor" ? (
                        <>
                          <p className="text-foreground">
                            {u.businessName || "No name set"}
                          </p>
                          <p className="text-xs">
                            {u.subscriptionPlan === "premium"
                              ? "Premium"
                              : "Free plan"}
                          </p>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-4 text-on-surface-variant">
                      {fmtDate(u.createdAt)}
                    </td>
                    <td className="p-4">
                      <StatusBadge
                        status={u.isBlocked ? "rejected" : "approved"}
                        label={u.isBlocked ? "blocked" : "active"}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setViewId(u._id)}
                          aria-label="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {u.role === "admin" ? (
                          <span className="px-2 text-xs text-muted-foreground">
                            Protected
                          </span>
                        ) : u.isBlocked ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setTarget(u)}
                            className="gap-1.5 text-basil"
                          >
                            <ShieldCheck className="h-4 w-4" /> Unblock
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setTarget(u)}
                            className="gap-1.5 text-secondary"
                          >
                            <ShieldBan className="h-4 w-4" /> Block
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} pages={data.pages} onChange={setPage} />
        </div>
      )}

      <UserDetailsDialog id={viewId} onClose={() => setViewId(null)} />

      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {target?.isBlocked ? "Unblock this user?" : "Block this user?"}
            </DialogTitle>
            <DialogDescription>
              {target?.isBlocked
                ? `${target?.name} will be able to use PizzaHub again.`
                : `${target?.name} will lose access to all protected features. If this is a vendor, their items also disappear from the public menu.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="secondary" onClick={() => setTarget(null)}>
              Cancel
            </Button>
            <Button
              disabled={busy}
              onClick={confirmToggle}
              className={
                target?.isBlocked
                  ? "bg-basil font-bold text-[#08390a] hover:bg-basil/90"
                  : "bg-tomato-container font-bold text-white hover:bg-tomato"
              }
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {target?.isBlocked ? "Unblock" : "Block user"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
