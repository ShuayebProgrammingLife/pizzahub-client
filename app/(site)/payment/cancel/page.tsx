"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, XCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/site/container";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export default function PaymentCancelPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const loggedIn = !!session;

  useEffect(() => {
    if (!isPending && !loggedIn)
      router.replace("/sign-in?next=%2Fpayment%2Fcancel");
  }, [isPending, loggedIn, router]);

  if (isPending || !loggedIn) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Container className="py-20">
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-lg border border-white/5 bg-card p-10 text-center">
        <XCircle className="h-12 w-12 text-secondary" />
        <h1 className="text-3xl font-bold">Payment cancelled</h1>
        <p className="text-on-surface-variant">
          You were not charged, and your plan has not changed. You can upgrade
          whenever you are ready.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard/vendor/subscription"
            className={cn(buttonVariants(), "font-bold")}
          >
            Back to subscription
          </Link>
          <Link
            href="/dashboard/vendor"
            className={cn(buttonVariants({ variant: "secondary" }))}
          >
            Dashboard
          </Link>
        </div>
      </div>
    </Container>
  );
}
