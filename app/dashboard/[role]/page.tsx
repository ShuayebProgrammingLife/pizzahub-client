"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function TempDashboard() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) router.replace("/sign-in");
  }, [session, isPending, router]);

  if (isPending || !session)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  return (
    <main className="mx-auto max-w-xl space-y-4 p-8">
      <h1 className="text-3xl font-bold">Temporary dashboard</h1>
      <pre className="overflow-auto rounded-lg border border-border bg-card p-4 text-sm">
        {JSON.stringify(session.user, null, 2)}
      </pre>
      <Button
        onClick={async () => {
          await authClient.signOut();
          router.replace("/sign-in");
        }}
      >
        Logout
      </Button>
    </main>
  );
}
