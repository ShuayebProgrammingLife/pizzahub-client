"use client";
/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, UploadCloud } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { uploadToImgBB } from "@/lib/imgbb";

export function ProfileForm({ isVendor }: { isVendor?: boolean }) {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [name, setName] = useState(user?.name ?? "");
  const [business, setBusiness] = useState(user?.businessName ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const preview = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  if (!user) return null;
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(f.type))
      return toast.error("Only PNG, JPG or WEBP allowed");
    if (f.size > 5 * 1024 * 1024)
      return toast.error("Image must be 5MB or smaller");
    setFile(f);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) return toast.error("Enter your name");
    if (isVendor && business.trim().length < 2)
      return toast.error("Enter your restaurant name");

    setLoading(true);
    try {
      const image = file ? await uploadToImgBB(file) : undefined;
      // role, plan and blocked status are never sent. The server also strips them.
      const { error } = await authClient.updateUser({
        name: name.trim(),
        ...(image ? { image } : {}),
        ...(isVendor ? { businessName: business.trim() } : {}),
      });
      if (error)
        throw new Error(error.message || "Could not update your profile");
      toast.success("Profile updated");
      setFile(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="max-w-xl space-y-5 rounded-lg border border-white/5 bg-card p-5 sm:p-6"
    >
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          {(preview || user.image) && (
            <AvatarImage src={preview ?? user.image!} alt={user.name} />
          )}
          <AvatarFallback className="bg-primary text-lg font-bold text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2 text-sm text-on-surface-variant transition hover:border-primary/50 hover:text-foreground">
          <UploadCloud className="h-4 w-4" />{" "}
          {file ? file.name : "Change photo"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={onPick}
          />
        </label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pname">Full Name</Label>
        <Input
          id="pname"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-11"
        />
      </div>

      {isVendor && (
        <div className="space-y-2">
          <Label htmlFor="pbiz">Restaurant / Business Name</Label>
          <Input
            id="pbiz"
            value={business}
            onChange={(e) => setBusiness(e.target.value)}
            className="h-11"
          />
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={user.email} disabled className="h-11" />
        </div>
        <div className="space-y-2">
          <Label>Role</Label>
          <Input
            value={String(user.role)}
            disabled
            className="h-11 capitalize"
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Email and role cannot be changed here.
      </p>

      <Button type="submit" disabled={loading} className="h-11 font-bold">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </form>
  );
}
