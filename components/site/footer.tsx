import Link from "next/link";
import { Flame, Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/site/container";

function XLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { href: "/menu", label: "Browse Menu" },
      { href: "/menu?category=Classic%20Pizzas", label: "Classic Pizzas" },
      { href: "/menu?category=Vegetarian%20Pizzas", label: "Vegetarian" },
      { href: "/menu?category=Meat%20Lovers", label: "Meat Lovers" },
    ],
  },
  {
    title: "For Vendors",
    links: [
      { href: "/sign-up", label: "Partner with Us" },
      { href: "/dashboard", label: "Vendor Dashboard" },
    ],
  },
  {
    title: "Platform",
    links: [
      { href: "/#why-us", label: "Why PizzaHub" },
      { href: "/#how-it-works", label: "How It Works" },
      { href: "/sign-in", label: "Sign In" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/5 bg-surface-lowest">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Flame className="h-5 w-5" />
              </span>
              <span className="font-heading text-xl font-bold text-ember">
                PizzaHub
              </span>
            </Link>
            <p className="max-w-sm text-sm text-on-surface-variant">
              Hot and fresh pizza from independent local kitchens, delivered to
              your door.
            </p>
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              aria-label="PizzaHub on X"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-surface-high text-on-surface-variant transition hover:text-primary"
            >
              <XLogo className="h-4 w-4" />
            </a>
          </div>

          {COLUMNS.map((c) => (
            <div key={c.title}>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-foreground">
                {c.title}
              </h4>
              <ul className="space-y-2.5 text-sm text-on-surface-variant">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="transition hover:text-primary"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-4 rounded-lg border border-white/5 bg-card p-5 text-sm text-on-surface-variant sm:grid-cols-3">
          <span className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" /> +880 1700-000000
          </span>
          <span className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" /> support@pizzahub.com
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> Dhaka, Bangladesh
          </span>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} PizzaHub. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
