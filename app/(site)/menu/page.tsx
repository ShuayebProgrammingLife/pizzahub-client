"use client";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Search, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Container } from "@/components/site/container";
import { ItemCard, ItemCardSkeleton } from "@/components/items/item-card";
import { publicFetch } from "@/lib/api";
import type { ItemsMeta, ItemsResponse } from "@/lib/types";
import { cn } from "@/lib/utils";

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

function BrowseInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const search = sp.get("search") ?? "";
  const category = sp.get("category") ?? "";
  const location = sp.get("location") ?? "";
  const sort = sp.get("sort") ?? "featured";
  const page = Math.max(1, Number(sp.get("page")) || 1);
  const query = sp.toString();

  const [q, setQ] = useState(search);
  const [data, setData] = useState<ItemsResponse | null>(null);
  const [meta, setMeta] = useState<ItemsMeta | null>(null);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const requestKey = `${query}:${reload}`;
  const [completedRequest, setCompletedRequest] = useState("");
  const loading = completedRequest !== requestKey;
  const visibleError = loading ? "" : error;

  const update = useCallback(
    (patch: Record<string, string>) => {
      const next = new URLSearchParams(sp.toString());
      Object.entries(patch).forEach(([k, v]) =>
        v ? next.set(k, v) : next.delete(k),
      );
      if (!("page" in patch)) next.delete("page"); // any filter change goes back to page 1
      const s = next.toString();
      router.replace(s ? `/menu?${s}` : "/menu", { scroll: false });
    },
    [sp, router],
  );

  // debounce the search box
  useEffect(() => {
    const t = setTimeout(() => {
      if (q.trim() !== search) update({ search: q.trim() });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    publicFetch<ItemsMeta>("/api/items/meta")
      .then(setMeta)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    publicFetch<ItemsResponse>(
      `/api/items?${query}${query ? "&" : ""}limit=9`,
      { signal: ctrl.signal },
    )
      .then((d) => {
        setData(d);
        setCompletedRequest(requestKey);
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Could not load the menu");
        setCompletedRequest(requestKey);
      });
    return () => ctrl.abort();
  }, [query, reload, requestKey]);

  const hasFilters = !!(search || category || location || sort !== "featured");
  const totalAll = meta?.categories.reduce((n, c) => n + c.count, 0);
  const sortLabel = SORTS.find((s) => s.value === sort)?.label ?? "Featured";

  return (
    <Container className="space-y-8 py-10">
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          Live menu
        </p>
        <h1 className="max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
          Browse Artisan Pizzas &amp; Kitchen Menus
        </h1>
        <p className="max-w-2xl text-on-surface-variant">
          Search by name, ingredient or restaurant, then filter by category and
          area.
        </p>
      </div>

      {/* Filters */}
      <div className="grid gap-3 rounded-lg border border-white/5 bg-card p-3 md:grid-cols-[1fr_220px_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search pizza, sauce, topping or restaurant..."
            className="h-11 pl-10"
          />
        </div>
        <Select
          value={location || "all"}
          onValueChange={(v: string | null) =>
            update({ location: !v || v === "all" ? "" : v })
          }
        >
          <SelectTrigger className="h-11 w-full">
            <SelectValue>{location || "All locations"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All locations</SelectItem>
            {meta?.locations.map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={sort}
          onValueChange={(v: string | null) =>
            update({ sort: !v || v === "featured" ? "" : v })
          }
        >
          <SelectTrigger className="h-11 w-full">
            <SelectValue>{sortLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SORTS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          {
            name: "",
            label: `All${totalAll !== undefined ? ` (${totalAll})` : ""}`,
          },
          ...(meta?.categories.map((c) => ({
            name: c.name,
            label: `${c.name} (${c.count})`,
          })) ?? []),
        ].map((c) => (
          <button
            key={c.name || "all"}
            type="button"
            onClick={() => update({ category: c.name })}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition",
              category === c.name
                ? "border-primary bg-primary text-primary-foreground"
                : "border-white/10 bg-surface-high text-on-surface-variant hover:border-primary/40 hover:text-foreground",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-on-surface-variant">
        <span>
          {data && !loading
            ? `${data.total} ${data.total === 1 ? "item" : "items"} found`
            : "Loading..."}
        </span>
        {hasFilters && (
          <button
            type="button"
            className="font-semibold text-primary hover:underline"
            onClick={() => {
              setQ("");
              router.replace("/menu", { scroll: false });
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Results */}
      {visibleError ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="mb-4 text-on-surface-variant">{visibleError}</p>
          <Button onClick={() => setReload((r) => r + 1)}>Try again</Button>
        </div>
      ) : loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ItemCardSkeleton key={i} />
          ))}
        </div>
      ) : data && data.items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-12 text-center">
          <SearchX className="h-10 w-10 text-primary" />
          <h3 className="text-xl font-bold">No pizzas match your search</h3>
          <p className="max-w-sm text-sm text-on-surface-variant">
            Try a different keyword or remove some filters.
          </p>
          <Button
            variant="secondary"
            onClick={() => {
              setQ("");
              router.replace("/menu", { scroll: false });
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data?.items.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
          {data && data.pages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button
                variant="secondary"
                disabled={page <= 1}
                onClick={() => update({ page: String(page - 1) })}
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>
              <span className="tabular text-sm text-on-surface-variant">
                Page {data.page} of {data.pages}
              </span>
              <Button
                variant="secondary"
                disabled={page >= data.pages}
                onClick={() => update({ page: String(page + 1) })}
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </Container>
  );
}

export default function BrowseMenuPage() {
  return (
    <Suspense
      fallback={
        <Container className="grid gap-5 py-10 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ItemCardSkeleton key={i} />
          ))}
        </Container>
      }
    >
      <BrowseInner />
    </Suspense>
  );
}
