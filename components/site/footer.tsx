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

function FacebookLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
    </svg>
  );
}

function LinkedInLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function WhatsAppLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

const SOCIALS = [
  { href: "https://x.com/ShuayebHossain1", label: "PizzaHub on X", Icon: XLogo },
  {
    href: "https://www.facebook.com/shuayeb.hossain.2024/",
    label: "PizzaHub on Facebook",
    Icon: FacebookLogo,
  },
  {
    href: "https://www.linkedin.com/in/shuayeb-hossain-dev/en/",
    label: "Shuayeb Hossain on LinkedIn",
    Icon: LinkedInLogo,
  },
  {
    href: "https://wa.me/8801727398320",
    label: "Chat on WhatsApp",
    Icon: WhatsAppLogo,
  },
];

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
            <div className="flex gap-2">
              {SOCIALS.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-surface-high text-on-surface-variant transition hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
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
          <a
            href="https://wa.me/8801727398320"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 transition-colors hover:text-primary"
          >
            <Phone className="h-4 w-4 text-primary" /> +880 1727-398320 (WhatsApp)
          </a>
          <a
            href="mailto:support@pizzahub.com"
            className="flex items-center gap-2 transition-colors hover:text-primary"
          >
            <Mail className="h-4 w-4 text-primary" /> support@pizzahub.com
          </a>
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
