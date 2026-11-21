"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Store,
  UploadCloud,
  Utensils,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth/auth-shell";
import { GoogleButton } from "@/components/auth/google-button";
import { authClient } from "@/lib/auth-client";
import { uploadToImgBB } from "@/lib/imgbb";

const ROLES = [
  {
    value: "customer",
    title: "Customer",
    tag: "Food Lover",
    icon: Utensils,
    desc: "Discover artisan pizzas, place orders and track them live.",
  },
  {
    value: "vendor",
    title: "Vendor",
    tag: "Pizzeria / Kitchen",
    icon: Store,
    desc: "List your menu, manage customer orders and grow your kitchen.",
  },
] as const;

export default function SignUpPage() {
  const router = useRouter();
  const [role, setRole] = useState<"customer" | "vendor">("customer");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const rules = [
    { label: "Min 6 characters", ok: password.length >= 6 },
    { label: "1 uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "1 lowercase letter", ok: /[a-z]/.test(password) },
  ];

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!["image/png", "image/jpeg"].includes(f.type)) {
      toast.error("Only PNG or JPG images are allowed");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5MB or smaller");
      return;
    }
    setFile(f);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return toast.error("Please enter your full name");
    if (role === "vendor" && !businessName.trim())
      return toast.error("Please enter your restaurant name");
    if (!rules.every((r) => r.ok))
      return toast.error("Password does not meet the rules");

    setLoading(true);
    try {
      let image: string | undefined;
      if (file) image = await uploadToImgBB(file);

      const { error } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        image,
        role,
        ...(role === "vendor" ? { businessName: businessName.trim() } : {}),
      });
      if (error) {
        toast.error(error.message || "Could not create your account");
        return;
      }
      toast.success("Account created. Welcome to PizzaHub!");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell active="sign-up">
      <div className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          Step 01 / Onboarding
        </p>
        <h2 className="text-3xl font-bold">Join the Night-Market Guild</h2>
        <p className="text-on-surface-variant">
          Select your role to set up permissions and tools.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {/* Role cards */}
        <div
          className="grid gap-3 sm:grid-cols-2"
          role="radiogroup"
          aria-label="Account role"
        >
          {ROLES.map((r) => {
            const on = role === r.value;
            return (
              <button
                key={r.value}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setRole(r.value)}
                className={`rounded-lg border bg-card p-4 text-left transition ${
                  on
                    ? "border-primary glow-amber"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-high text-ember">
                    <r.icon className="h-4 w-4" />
                  </span>
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${on ? "border-primary bg-primary text-primary-foreground" : "border-outline-variant"}`}
                  >
                    {on && <Check className="h-3 w-3" />}
                  </span>
                </div>
                <p className="font-heading text-lg font-bold">{r.title}</p>
                <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-ember">
                  {r.tag}
                </p>
                <p className="text-sm text-on-surface-variant">{r.desc}</p>
              </button>
            );
          })}
        </div>

        <p className="flex items-start gap-2 rounded-lg border border-border bg-surface-lowest p-3 text-sm text-on-surface-variant">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" />
          Admin accounts cannot be registered publicly. They are provisioned
          securely on the server.
        </p>

        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Matteo Rossi"
            className="h-12"
          />
        </div>

        {role === "vendor" && (
          <div className="space-y-2">
            <Label htmlFor="biz">Restaurant / Business Name</Label>
            <Input
              id="biz"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Forno Antico"
              className="h-12"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="matteo@example.com"
            className="h-12"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Secure Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a sturdy password"
              className="h-12 pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-foreground"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 rounded-md bg-surface-lowest px-3 py-2 text-xs">
            {rules.map((r) => (
              <li
                key={r.label}
                className={`flex items-center gap-1.5 ${r.ok ? "text-basil" : "text-muted-foreground"}`}
              >
                <Check
                  className={`h-3 w-3 ${r.ok ? "opacity-100" : "opacity-30"}`}
                />
                {r.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Profile Avatar</Label>
            <span className="text-xs text-muted-foreground">Optional</span>
          </div>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border bg-card p-4 transition hover:border-primary/50">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-high text-ember">
              <UploadCloud className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">
                {file ? file.name : "Upload avatar image"}
              </span>
              <span className="block text-xs text-muted-foreground">
                PNG or JPG, up to 5MB
              </span>
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={onPickFile}
            />
          </label>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-lg text-base font-bold glow-amber"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Create PizzaHub Account"
          )}
        </Button>

        <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or continue with{" "}
          <span className="h-px flex-1 bg-border" />
        </div>
        <GoogleButton role={role} />
      </form>
    </AuthShell>
  );
}
