"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MotionConfig, motion } from "motion/react";
import {
  ArrowRight,
  BadgeCheck,
  Beef,
  ChefHat,
  CupSoda,
  Flame,
  Leaf,
  Pizza,
  Salad,
  Search,
  ShieldCheck,
  Store,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/site/container";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";
import { ItemCard, ItemCardSkeleton } from "@/components/items/item-card";
import { publicFetch } from "@/lib/api";
import type { ItemsMeta, MenuItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "Classic Pizzas": Pizza,
  "Vegetarian Pizzas": Leaf,
  "Meat Lovers": Beef,
  "Specialty / Gourmet Pizzas": ChefHat,
  "Sides & Appetizers": Salad,
  "Beverages & Desserts": CupSoda,
};

const WHY = [
  {
    icon: BadgeCheck,
    title: "Vetted Menus",
    text: "Every menu item is reviewed and approved by our admins before it goes live.",
  },
  {
    icon: Flame,
    title: "Hot & Fresh",
    text: "Order straight from local kitchens so your pizza arrives the way it should.",
  },
  {
    icon: Store,
    title: "Support Local",
    text: "Independent restaurants set their own menus, prices and delivery areas.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Accounts",
    text: "Role-based access keeps customers, vendors and admins safely separated.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Pick Your Pizza",
    text: "Browse local menus, search by name and filter by category or area.",
  },
  {
    n: "02",
    title: "Place Your Order",
    text: "Choose a delivery date, add your address and any special instructions.",
  },
  {
    n: "03",
    title: "Track Its Status",
    text: "The restaurant accepts your order and you follow it from your dashboard.",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [featured, setFeatured] = useState<MenuItem[] | null>(null);
  const [meta, setMeta] = useState<ItemsMeta | null>(null);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let alive = true;
    Promise.all([
      publicFetch<{ items: MenuItem[] }>("/api/items/featured?limit=6"),
      publicFetch<ItemsMeta>("/api/items/meta"),
    ])
      .then(([f, m]) => {
        if (!alive) return;
        setFeatured(f.items);
        setMeta(m);
      })
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, [reload]);

  const spotlight = featured?.[0];

  return (
    <MotionConfig reducedMotion="user">
      {/* HERO */}
      <section className="relative overflow-hidden bg-surface-lowest">
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-1/3 h-[28rem] w-[28rem] rounded-full bg-tomato-container/15 blur-3xl" />
        <Container className="relative grid items-center gap-12 py-14 lg:grid-cols-12 lg:py-24">
          <motion.div
            className="space-y-6 lg:col-span-7"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-tomato-container/30 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-danger">
              <span className="h-2 w-2 rounded-full bg-danger" /> Live Oven
              Network
            </span>
            <h1 className="text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
              Hot &amp; Fresh{" "}
              <span className="italic text-ember">Artisan Pizza</span> Delivered
              to Your Door.
            </h1>
            <p className="max-w-xl text-lg text-on-surface-variant">
              Order from top-rated local pizzerias, crafted with slow-fermented
              dough, ripe tomatoes and real mozzarella.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/menu"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "gap-2 rounded-full px-7 font-bold glow-amber",
                )}
              >
                <Flame className="h-4 w-4" /> Explore Pizza Menu
              </Link>
              <a
                href="#how-it-works"
                className={cn(
                  buttonVariants({ size: "lg", variant: "secondary" }),
                  "rounded-full px-6",
                )}
              >
                How PizzaHub Works
              </a>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                router.push(
                  q.trim()
                    ? `/menu?search=${encodeURIComponent(q.trim())}`
                    : "/menu",
                );
              }}
              className="flex max-w-xl items-center gap-2 rounded-xl border border-white/5 bg-surface-high p-2"
            >
              <Search className="ml-2 h-5 w-5 shrink-0 text-outline" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Craving truffle, burrata, diavola..."
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-outline/70"
              />
              <Button type="submit" size="sm" className="font-bold">
                Search
              </Button>
            </form>
          </motion.div>

          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          >
            {spotlight ? (
              <Link
                href={`/menu/${spotlight._id}`}
                className="group block overflow-hidden rounded-xl border border-primary/20 bg-card"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={spotlight.images[0]}
                    alt={spotlight.itemName}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute right-3 top-3 rounded-full bg-primary px-3 py-1 text-sm font-bold tabular text-primary-foreground">
                    ${spotlight.price.toFixed(2)}
                  </span>
                </div>
                <div className="p-5">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-ember">
                    Chef&apos;s spotlight
                  </p>
                  <h3 className="mt-1 line-clamp-1 text-xl font-bold">
                    {spotlight.itemName}
                  </h3>
                  <p className="text-sm text-on-surface-variant">
                    {spotlight.vendor.name} · {spotlight.location}
                  </p>
                </div>
              </Link>
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-white/5 bg-card">
                <Flame className="h-16 w-16 text-primary/60" />
              </div>
            )}
          </motion.div>
        </Container>
      </section>

      {/* CATEGORIES */}
      <section className="py-16">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Handcrafted disciplines"
              title="Browse by Category"
              subtitle="Find exactly what you are craving."
            />
          </Reveal>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {(
              meta?.categories ??
              Object.keys(CATEGORY_ICONS).map((name) => ({
                name,
                count: 0,
                cover: null,
              }))
            ).map((c, i) => {
              const Icon = CATEGORY_ICONS[c.name] ?? Pizza;
              return (
                <Reveal key={c.name} delay={i * 0.05}>
                  <Link
                    href={`/menu?category=${encodeURIComponent(c.name)}`}
                    className="group relative block aspect-square overflow-hidden rounded-lg border border-white/5 bg-card transition hover:border-primary/40"
                  >
                    {c.cover && (
                      <img
                        src={c.cover}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover opacity-60 transition duration-500 group-hover:scale-105 group-hover:opacity-80"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    <div className="relative flex h-full flex-col justify-between p-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-black/50 text-ember backdrop-blur">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-bold leading-tight">
                          {c.name}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {c.count} {c.count === 1 ? "item" : "items"}
                        </p>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* FEATURED */}
      <section className="pb-16">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Kitchen certified"
              title="Featured Menu Items"
              subtitle="Approved pizzas from our restaurants, with Premium partners shown first."
              action={
                <Link
                  href="/menu"
                  className={cn(
                    buttonVariants({ variant: "secondary" }),
                    "gap-2",
                  )}
                >
                  View full menu <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />
          </Reveal>

          {error ? (
            <div className="rounded-lg border border-border bg-card p-10 text-center">
              <p className="mb-4 text-on-surface-variant">
                We could not load the menu. Please try again.
              </p>
              <Button
                onClick={() => {
                  setError(false);
                  setReload((r) => r + 1);
                }}
              >
                Retry
              </Button>
            </div>
          ) : featured === null ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ItemCardSkeleton key={i} />
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-10 text-center text-on-surface-variant">
              No approved menu items yet. Check back soon!
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((item, i) => (
                <Reveal key={item._id} delay={i * 0.05} className="h-full">
                  <ItemCard item={item} />
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* WHY CHOOSE */}
      <section id="why-us" className="scroll-mt-24 bg-surface-lowest py-16">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="The craft standard"
              title="Why Choose PizzaHub?"
              subtitle="We connect hungry people with real local kitchens."
            />
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map((w, i) => (
              <Reveal key={w.title} delay={i * 0.06} className="h-full">
                <div className="h-full rounded-lg border border-white/5 bg-card p-6 transition hover:border-primary/40">
                  <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-surface-high text-ember">
                    <w.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mb-2 text-lg font-bold">{w.title}</h3>
                  <p className="text-sm text-on-surface-variant">{w.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="scroll-mt-24 py-16">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Simple 3-step flow"
              title="How PizzaHub Works"
              subtitle="From craving to doorstep in three easy steps."
            />
          </Reveal>
          <div className="grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.08} className="h-full">
                <div className="relative h-full overflow-hidden rounded-lg border border-white/5 bg-card p-6">
                  <span className="absolute right-4 top-2 font-heading text-6xl font-extrabold text-white/5">
                    {s.n}
                  </span>
                  <Truck className="mb-4 h-6 w-6 text-primary" />
                  <h3 className="mb-2 text-lg font-bold">{s.title}</h3>
                  <p className="text-sm text-on-surface-variant">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </MotionConfig>
  );
}
