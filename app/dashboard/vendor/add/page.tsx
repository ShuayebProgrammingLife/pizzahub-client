"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";
import { uploadToImgBB } from "@/lib/imgbb";
import { CATEGORIES } from "@/lib/constants";

export default function AddMenuItemPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const previews = useMemo(
    () => files.map((f) => URL.createObjectURL(f)),
    [files],
  );
  useEffect(
    () => () => previews.forEach((u) => URL.revokeObjectURL(u)),
    [previews],
  );

  useEffect(() => {
    if (isPending) return;
    if (!session) router.replace("/sign-in");
    else if (session.user.role !== "vendor") {
      toast.error("Only vendors can add menu items");
      router.replace("/dashboard");
    }
  }, [session, isPending, router]);

  if (isPending || session?.user.role !== "vendor") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";
    const valid = picked.filter((f) => {
      if (!["image/png", "image/jpeg", "image/webp"].includes(f.type)) {
        toast.error(`${f.name}: only PNG, JPG or WEBP allowed`);
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name}: must be 5MB or smaller`);
        return false;
      }
      return true;
    });
    const next = [...files, ...valid];
    if (next.length > 4) toast.error("You can upload up to 4 images");
    setFiles(next.slice(0, 4));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) return toast.error("Enter the item name");
    if (!category) return toast.error("Choose a category");
    if (description.trim().length < 10)
      return toast.error("Description needs at least 10 characters");
    if (!(Number(price) > 0)) return toast.error("Enter a valid price");
    if (location.trim().length < 2) return toast.error("Enter the location");
    if (files.length === 0) return toast.error("Upload at least one image");

    setLoading(true);
    try {
      const images = await Promise.all(files.map((f) => uploadToImgBB(f)));
      await apiFetch("/api/items", {
        method: "POST",
        body: JSON.stringify({
          itemName: name,
          category,
          description,
          price: Number(price),
          location,
          images,
        }),
      });
      toast.success("Item submitted. It goes live after admin approval.");
      router.push("/dashboard/vendor");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6 sm:p-10">
      <Link
        href="/dashboard/vendor"
        className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Create New Pizza Item</h1>
        <p className="text-on-surface-variant">
          New items start as Pending until an admin approves them.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-lg border border-border bg-card p-5 sm:p-6"
      >
        <div className="space-y-2">
          <Label htmlFor="name">Item Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Hot Honey Pepperoni"
            className="h-12"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={category}
              onValueChange={(value) => {
                if (value !== null) setCategory(value);
              }}
            >
              <SelectTrigger className="h-12 w-full">
                <SelectValue placeholder="Choose category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="18.50"
              className="h-12 tabular"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location (area / city)</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Dhanmondi, Dhaka"
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="desc">Description</Label>
          <Textarea
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ingredients, crust, size, what makes it special..."
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Images</Label>
            <span className="text-xs text-muted-foreground">
              {files.length}/4 · first image is the cover
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {previews.map((src, i) => (
              <div
                key={src}
                className="relative aspect-square overflow-hidden rounded-lg border border-border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Preview ${i + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                  className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white hover:bg-tomato"
                  aria-label="Remove image"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {files.length < 4 && (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-on-surface-variant transition hover:border-primary/50 hover:text-foreground">
                <ImagePlus className="h-6 w-6" />
                <span className="text-xs">Add image</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  className="hidden"
                  onChange={onPickFiles}
                />
              </label>
            )}
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full text-base font-bold glow-amber"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Uploading and
              saving...
            </>
          ) : (
            "Submit for Approval"
          )}
        </Button>
      </form>
    </main>
  );
}
