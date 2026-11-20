import Link from "next/link";
import { Flame, ShieldCheck } from "lucide-react";

export function AuthShell({
  active,
  children,
}: {
  active: "sign-up" | "sign-in";
  children: React.ReactNode;
}) {
  const tab = (href: string, label: string, on: boolean) => (
    <Link
      href={href}
      className={`flex-1 rounded-md px-5 py-2.5 text-center text-sm font-semibold transition ${
        on
          ? "bg-primary text-primary-foreground"
          : "text-on-surface-variant hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-surface-lowest p-12 lg:flex">
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-0 h-[28rem] w-[28rem] rounded-full bg-tomato-container/20 blur-3xl" />

        <Link href="/" className="relative flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Flame className="h-5 w-5" />
          </span>
          <span className="font-heading text-xl font-bold text-ember">
            PizzaHub
          </span>
        </Link>

        <div className="relative space-y-6">
          <h1 className="text-5xl font-extrabold leading-[1.05]">
            Pure Flame.
            <br />
            <span className="italic text-ember">Wild Yeast.</span>
            <br />
            Zero Compromise.
          </h1>
          <p className="max-w-md border-l-2 border-primary pl-4 text-lg text-on-surface-variant">
            The finest sourdough pizza from independent artisan kitchens,
            delivered hot.
          </p>
        </div>

        <div className="relative flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm text-on-surface-variant">
          <ShieldCheck className="h-4 w-4 text-basil" />
          Secured by Better Auth, strict role-based access
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-lg space-y-6">
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <Flame className="h-5 w-5 text-primary" />
            <span className="font-heading text-lg font-bold text-ember">
              PizzaHub
            </span>
          </Link>
          <div className="flex gap-1 rounded-lg bg-surface-high p-1">
            {tab("/sign-up", "Create Account", active === "sign-up")}
            {tab("/sign-in", "Welcome Back", active === "sign-in")}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
