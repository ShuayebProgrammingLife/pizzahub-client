"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  Flame,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Container } from "@/components/site/container";
import { authClient } from "@/lib/auth-client";
import { clearApiToken } from "@/lib/api";
import { cn } from "@/lib/utils";

const ROLE_LABEL: Record<string, string> = {
  vendor: "Vendor Partner",
  customer: "Customer",
  admin: "Administrator",
};

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [open, setOpen] = useState(false);

  const user = session?.user;
  const links = [
    { href: "/", label: "Home" },
    { href: "/menu", label: "Browse Menu" },
    ...(user ? [{ href: "/dashboard", label: "Dashboard" }] : []),
  ];
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  async function logout() {
    clearApiToken();
    await authClient.signOut();
    toast.success("You have been logged out");
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  const initials = (user?.name ?? "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-surface-container/90 backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between gap-4 lg:h-20">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Flame className="h-5 w-5" />
            </span>
            <span className="font-heading text-xl font-bold text-ember">
              PizzaHub
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-semibold transition-colors",
                  isActive(l.href)
                    ? "bg-surface-high text-ember"
                    : "text-on-surface-variant hover:bg-surface-high hover:text-foreground",
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {isPending ? (
            <Skeleton className="hidden h-10 w-40 rounded-full md:block" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full bg-surface-high p-1 pl-3 outline-none transition hover:bg-surface-highest focus-visible:ring-2 focus-visible:ring-ring">
                <span className="hidden flex-col text-right leading-tight sm:flex">
                  <span className="text-sm font-semibold">{user.name}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-basil">
                    {ROLE_LABEL[user.role as string] ?? "Member"}
                  </span>
                </span>
                <Avatar className="h-8 w-8">
                  {user.image && (
                    <AvatarImage src={user.image} alt={user.name} />
                  )}
                  <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="mr-1 hidden h-4 w-4 text-on-surface-variant sm:block" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-semibold">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard")}
                  className="cursor-pointer gap-2"
                >
                  <LayoutDashboard className="h-4 w-4 text-primary" /> Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push(`/dashboard/${user.role}/profile`)}
                  className="cursor-pointer gap-2"
                >
                  <Settings className="h-4 w-4 text-primary" /> Profile Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer gap-2 text-secondary"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/sign-in"
                className={buttonVariants({ variant: "ghost" })}
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className={cn(buttonVariants(), "font-bold")}
              >
                Sign Up
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="rounded-md p-2 text-on-surface-variant hover:bg-surface-high md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </Container>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-white/5 bg-surface-container md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2.5 text-sm font-semibold",
                  isActive(l.href)
                    ? "bg-surface-high text-ember"
                    : "text-on-surface-variant",
                )}
              >
                {l.label}
              </Link>
            ))}
            {!isPending && !user && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link
                  href="/sign-in"
                  onClick={() => setOpen(false)}
                  className={buttonVariants({ variant: "secondary" })}
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setOpen(false)}
                  className={cn(buttonVariants(), "font-bold")}
                >
                  Sign Up
                </Link>
              </div>
            )}
            {user && (
              <>
                <Link
                  href={`/dashboard/${user.role}/profile`}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-semibold text-on-surface-variant"
                >
                  Profile Settings
                </Link>
                <button
                  onClick={logout}
                  className="rounded-md px-3 py-2.5 text-left text-sm font-semibold text-secondary"
                >
                  Logout
                </button>
              </>
            )}
          </Container>
        </div>
      )}
    </header>
  );
}
