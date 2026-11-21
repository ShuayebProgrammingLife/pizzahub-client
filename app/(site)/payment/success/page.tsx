"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  CheckCircle2,
  Clock,
  Loader2,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/site/container";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";
import { fmtMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

type Phase = "checking" | "paid" | "failed" | "expired" | "timeout" | "error";

function SuccessInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const sessionId = sp.get("session_id") ?? "";
  const { data: session, isPending } = authClient.useSession();
  const loggedIn = !!session;
  const role = session?.user.role as string | undefined;

  const [phase, setPhase] = useState<Phase>("checking");
  const [info, setInfo] = useState<{ amount: number; currency: string } | null>(
    null,
  );

  useEffect(() => {
    if (isPending) return; // wait for the session so a reload never bounces to sign-in
    if (!loggedIn) {
      router.replace(
        `/sign-in?next=${encodeURIComponent(`/payment/success?session_id=${sessionId}`)}`,
      );
      return;
    }
    if (role !== "vendor") {
      router.replace("/dashboard");
      return;
    }
    if (!sessionId) {
      const timer = setTimeout(() => setPhase("error"), 0);
      return () => clearTimeout(timer);
    }

    let alive = true;
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;

    // Premium is switched on by the verified Stripe webhook, never by this page.
    // We only ask the server what the webhook has recorded so far.
    const poll = async () => {
      try {
        const r = await apiFetch<{
          status: string;
          amount: number;
          currency: string;
        }>(`/api/payments/status?session_id=${encodeURIComponent(sessionId)}`);
        if (!alive) return;
        if (r.status === "paid") {
          setInfo({ amount: r.amount, currency: r.currency });
          setPhase("paid");
          toast.success("Payment confirmed. You are now Premium!");
          return;
        }
        if (r.status === "failed" || r.status === "expired") {
          setPhase(r.status);
          return;
        }
      } catch {
        if (alive) setPhase("error");
        return;
      }
      tries += 1;
      if (tries >= 20) {
        if (alive) setPhase("timeout");
        return;
      }
      timer = setTimeout(poll, 2000);
    };
    poll();

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [isPending, loggedIn, role, sessionId, router]);

  const view = {
    checking: {
      icon: <Loader2 className="h-12 w-12 animate-spin text-primary" />,
      title: "Confirming your payment...",
      text: "Please wait while Stripe confirms your payment. This usually takes a few seconds.",
    },
    paid: {
      icon: <CheckCircle2 className="h-12 w-12 text-basil" />,
      title: "Payment successful",
      text: info
        ? `We received ${fmtMoney(info.amount, info.currency)}. Your Premium plan is now active.`
        : "Your Premium plan is now active.",
    },
    failed: {
      icon: <XCircle className="h-12 w-12 text-danger" />,
      title: "Payment failed",
      text: "Your payment did not go through and you were not charged. Please try again.",
    },
    expired: {
      icon: <XCircle className="h-12 w-12 text-danger" />,
      title: "Checkout expired",
      text: "This checkout session expired. Start a new upgrade to continue.",
    },
    timeout: {
      icon: <Clock className="h-12 w-12 text-primary" />,
      title: "Still processing",
      text: "Your payment is still being confirmed. Premium turns on automatically as soon as Stripe confirms it. Check your subscription page in a minute.",
    },
    error: {
      icon: <TriangleAlert className="h-12 w-12 text-primary" />,
      title: "We could not find this payment",
      text: "Open your subscription page to check your current plan.",
    },
  }[phase];

  return (
    <Container className="py-20">
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-lg border border-white/5 bg-card p-10 text-center">
        {view.icon}
        <h1 className="text-3xl font-bold">{view.title}</h1>
        <p className="text-on-surface-variant">{view.text}</p>
        {phase !== "checking" && (
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard/vendor/subscription"
              className={cn(buttonVariants(), "font-bold")}
            >
              {phase === "paid" ? "View subscription" : "Go to subscription"}
            </Link>
            <Link
              href="/dashboard/vendor"
              className={cn(buttonVariants({ variant: "secondary" }))}
            >
              Dashboard
            </Link>
          </div>
        )}
      </div>
    </Container>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <SuccessInner />
    </Suspense>
  );
}
