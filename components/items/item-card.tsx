/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ArrowRight, Crown, MapPin } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { MenuItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ItemCard({ item }: { item: MenuItem }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-white/5 bg-card transition hover:border-primary/40">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-high">
        <img
          src={item.images[0]}
          alt={item.itemName}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded bg-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-ember backdrop-blur">
          {item.category}
        </span>
        {item.vendor.isPremium && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
            <Crown className="h-3 w-3" /> Premium
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-3 text-xs text-on-surface-variant">
          <span className="truncate font-semibold text-foreground">
            {item.vendor.name}
          </span>
          <span className="flex max-w-[50%] shrink-0 items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{item.location}</span>
          </span>
        </div>
        <h3 className="line-clamp-1 text-lg font-bold">{item.itemName}</h3>
        <p className="line-clamp-2 min-h-[2.5rem] text-sm text-on-surface-variant">
          {item.description}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Price
            </p>
            <p className="tabular text-xl font-bold">
              ${item.price.toFixed(2)}
            </p>
          </div>
          <Link
            href={`/menu/${item._id}`}
            className={cn(buttonVariants({ size: "sm" }), "gap-1.5 font-bold")}
          >
            View Details <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ItemCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-white/5 bg-card">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-10 w-full" />
        <div className="flex items-end justify-between pt-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>
    </div>
  );
}
