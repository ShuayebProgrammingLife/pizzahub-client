import Link from "next/link";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Container } from "@/components/site/container";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Container className="flex flex-col items-center gap-5 py-24 text-center">
          <p className="font-heading text-8xl font-extrabold text-ember">404</p>
          <h1 className="text-3xl font-bold sm:text-4xl">
            This slice is missing
          </h1>
          <p className="max-w-md text-on-surface-variant">
            The page you are looking for does not exist or has moved. Let&apos;s
            get you back to the good stuff.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className={cn(
                buttonVariants({ size: "lg" }),
                "rounded-full px-7 font-bold glow-amber",
              )}
            >
              Back to home
            </Link>
            <Link
              href="/menu"
              className={cn(
                buttonVariants({ size: "lg", variant: "secondary" }),
                "rounded-full px-6",
              )}
            >
              Browse menu
            </Link>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
