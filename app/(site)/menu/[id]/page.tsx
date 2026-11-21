"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Crown,
  Loader2,
  MapPin,
  ShoppingBag,
  TriangleAlert,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/site/container";
import { OrderDialog } from "@/components/items/order-dialog";
import { authClient } from "@/lib/auth-client";
import { publicFetch } from "@/lib/api";
import type { MenuItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function ItemDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const loggedIn = !!session;
  const role = session?.user.role as string | undefined;

  const [loadState, setLoadState] = useState<{
    id: string;
    status: "loading" | "success" | "error";
    item?: MenuItem;
    error?: string;
  }>({ id: "", status: "loading" });
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isPending) return; // wait for the session so a reload never bounces to sign-in
    if (!loggedIn) {
      router.replace(`/sign-in?next=${encodeURIComponent(`/menu/${id}`)}`);
      return;
    }
    let alive = true;
    publicFetch<{ item: MenuItem }>(`/api/items/${id}`)
      .then((d) => {
        if (!alive) return;
        setLoadState({ id, status: "success", item: d.item });
        setActive(0);
      })
      .catch((e: unknown) => {
        if (!alive) return;
        setLoadState({
          id,
          status: "error",
          error: e instanceof Error ? e.message : "Could not load this item",
        });
      });
    return () => {
      alive = false;
    };
  }, [id, loggedIn, isPending, router]);

  const currentState =
    loadState.id === id ? loadState : { id, status: "loading" as const };
  const item = currentState.status === "success" ? currentState.item : null;

  if (isPending || !loggedIn || currentState.status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (currentState.status === "error" || !item) {
    return (
      <Container className="py-20">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-lg border border-border bg-card p-10 text-center">
          <TriangleAlert className="h-10 w-10 text-primary" />
          <h1 className="text-2xl font-bold">Item not found</h1>
          <p className="text-on-surface-variant">
            {currentState.status === "error"
              ? currentState.error
              : "This item is not available."}
          </p>
          <Link href="/menu" className={cn(buttonVariants(), "font-bold")}>
            Back to menu
          </Link>
        </div>
      </Container>
    );
  }

  const initials = item.vendor.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Container className="space-y-6 py-10">
      <Link
        href="/menu"
        className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to menu
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="aspect-[4/3] overflow-hidden rounded-lg border border-white/5 bg-surface-high">
            <img
              src={item.images[active]}
              alt={item.itemName}
              className="h-full w-full object-cover"
            />
          </div>
          {item.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {item.images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setActive(i)}
                  className={cn(
                    "aspect-square overflow-hidden rounded-lg border-2 transition",
                    i === active
                      ? "border-primary"
                      : "border-transparent opacity-70 hover:opacity-100",
                  )}
                  aria-label={`Show image ${i + 1}`}
                >
                  <img
                    src={src}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-surface-high px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-ember">
                {item.category}
              </span>
              {item.vendor.isPremium && (
                <span className="inline-flex items-center gap-1 rounded bg-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground">
                  <Crown className="h-3 w-3" /> Premium
                </span>
              )}
            </div>
            <h1 className="text-4xl font-extrabold leading-tight">
              {item.itemName}
            </h1>
            <p className="flex items-center gap-1.5 text-on-surface-variant">
              <MapPin className="h-4 w-4 text-primary" /> {item.location}
            </p>
          </div>

          <p className="tabular text-4xl font-bold text-ember">
            ${item.price.toFixed(2)}
          </p>

          <p className="whitespace-pre-line leading-relaxed text-on-surface-variant">
            {item.description}
          </p>

          {/* Kitchen Prep & Dough Metrics */}
          <div className="grid grid-cols-2 gap-3 text-on-surface">
            <div className="rounded-lg border border-white/5 bg-surface-high p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Oven Bake Time</span>
              <p className="font-heading text-base font-bold text-ember">18–22 mins @ 900°F</p>
            </div>
            <div className="rounded-lg border border-white/5 bg-surface-high p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Fermentation</span>
              <p className="font-heading text-base font-bold text-basil">48h Slow Poolish</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-card p-4">
            <Avatar className="h-11 w-11">
              {item.vendor.image && (
                <AvatarImage src={item.vendor.image} alt={item.vendor.name} />
              )}
              <AvatarFallback className="bg-primary font-bold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Sold by
              </p>
              <p className="font-bold">{item.vendor.name}</p>
            </div>
          </div>

          {role === "customer" ? (
            <Button
              size="lg"
              className="h-12 w-full gap-2 text-base font-bold glow-amber"
              onClick={() => setOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" /> Order This Pizza
            </Button>
          ) : (
            <p className="rounded-lg border border-border bg-surface-lowest p-4 text-sm text-on-surface-variant">
              {role === "vendor"
                ? "Vendor accounts cannot place orders. Sign in with a customer account to order."
                : "Admin accounts cannot place customer orders."}
            </p>
          )}
        </div>
      </div>

      {role === "customer" && (
        <OrderDialog item={item} open={open} onOpenChange={setOpen} />
      )}
    </Container>
  );
}
