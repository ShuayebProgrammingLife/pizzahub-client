"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ClipboardList,
  Crown,
  Flame,
  Home,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  PlusCircle,
  Settings,
  ShoppingBag,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { authClient } from "@/lib/auth-client";
import { clearApiToken } from "@/lib/api";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};
type Role = "vendor" | "customer"; // "admin" is added in its own step

const NAV: Record<Role, NavItem[]> = {
  vendor: [
    {
      href: "/dashboard/vendor",
      label: "Overview",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: "/dashboard/vendor/items",
      label: "My Menu Items",
      icon: UtensilsCrossed,
    },
    { href: "/dashboard/vendor/add", label: "Add Menu Item", icon: PlusCircle },
    {
      href: "/dashboard/vendor/orders",
      label: "Customer Orders",
      icon: ClipboardList,
    },
    {
      href: "/dashboard/vendor/subscription",
      label: "Subscription",
      icon: Crown,
    },
    {
      href: "/dashboard/vendor/profile",
      label: "Profile Settings",
      icon: Settings,
    },
  ],
  customer: [
    {
      href: "/dashboard/customer",
      label: "Overview",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: "/dashboard/customer/orders",
      label: "My Orders",
      icon: ShoppingBag,
    },
    {
      href: "/dashboard/customer/profile",
      label: "Profile Settings",
      icon: Settings,
    },
  ],
};

const ROLE_LABEL: Record<string, string> = {
  vendor: "Vendor Partner",
  customer: "Customer",
  admin: "Administrator",
};

export function DashboardShell({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const userRole = session?.user.role as string | undefined;
  const allowed = !!session && userRole === role;

  useEffect(() => {
    if (isPending) return; // wait for the session so reloads never bounce to sign-in
    if (!session) {
      router.replace(`/sign-in?next=${encodeURIComponent(pathname)}`);
    } else if (userRole !== role) {
      toast.error("You do not have access to that dashboard");
      router.replace(userRole ? `/dashboard/${userRole}` : "/dashboard");
    }
  }, [isPending, session, userRole, role, pathname, router]);

  if (isPending || !allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const user = session.user;
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const isActive = (n: NavItem) =>
    n.exact ? pathname === n.href : pathname.startsWith(n.href);

  async function logout() {
    clearApiToken();
    await authClient.signOut();
    toast.success("You have been logged out");
    router.push("/");
    router.refresh();
  }

  const sidebar = (
    <div className="flex h-full flex-col gap-6 p-4">
      <Link href="/" className="flex items-center gap-2 px-2 pt-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Flame className="h-5 w-5" />
        </span>
        <span className="font-heading text-xl font-bold text-ember">
          PizzaHub
        </span>
      </Link>

      <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {ROLE_LABEL[role]} hub
      </p>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV[role].map((n) => (
          <Link
            key={n.href}
            href={n.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors",
              isActive(n)
                ? "bg-primary text-primary-foreground"
                : "text-on-surface-variant hover:bg-surface-high hover:text-foreground",
            )}
          >
            <n.icon className="h-4 w-4" /> {n.label}
          </Link>
        ))}
        <Link
          href="/"
          className="mt-2 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-high hover:text-foreground"
        >
          <Home className="h-4 w-4" /> Back to site
        </Link>
      </nav>

      <div className="rounded-lg bg-surface-lowest p-3">
        <div className="mb-3 flex items-center gap-3">
          <Avatar className="h-9 w-9">
            {user.image && <AvatarImage src={user.image} alt={user.name} />}
            <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-basil">
              {ROLE_LABEL[role]}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-surface-high py-2 text-sm font-semibold text-secondary transition hover:bg-surface-highest"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="sticky top-0 hidden h-screen overflow-y-auto border-r border-white/5 bg-surface-container lg:block">
        {sidebar}
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/5 bg-surface-container/90 px-4 backdrop-blur lg:hidden">
          <button
            onClick={() => setOpen(true)}
            className="rounded-md p-2 text-on-surface-variant hover:bg-surface-high"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="font-heading text-lg font-bold text-ember">
            PizzaHub
          </Link>
          <span className="w-9" />
        </header>
        <main className="flex-1 space-y-8 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="w-72 border-white/5 bg-surface-container p-0"
        >
          <SheetTitle className="sr-only">Dashboard menu</SheetTitle>
          {sidebar}
        </SheetContent>
      </Sheet>
    </div>
  );
}
