"use client";
import { useEffect } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function GlobalRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <TriangleAlert className="h-12 w-12 text-primary" />
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="max-w-md text-on-surface-variant">
        An unexpected error happened. You can try again, or go back to the home
        page.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={reset} className="font-bold">
          Try again
        </Button>
        <Link href="/" className={cn(buttonVariants({ variant: "secondary" }))}>
          Go home
        </Link>
      </div>
    </div>
  );
}
