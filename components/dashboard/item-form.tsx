"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";
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
import { uploadToImgBB } from "@/lib/imgbb";
import { CATEGORIES } from "@/lib/constants";
import type { VendorItem } from "@/lib/types";

export type ItemPayload = {
  itemName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images: string[];
};

export function ItemForm({
  initial,
  submitLabel,
  notice,
  onSubmit,
}: {
  initial?: Partial<VendorItem>;
  submitLabel: string;
  notice?: React.ReactNode;
  onSubmit: (payload: ItemPayload) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.itemName ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(
    initial?.price !== undefined ? String(initial.price) : "",
  );
  const [location, setLocation] = useState(initial?.location ?? "");
  const [existing, setExisting] = useState<string[]>(initial?.images ?? []);
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
  const total = existing.length + files.length;

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
    if (total + valid.length > 4) toast.error("You can have up to 4 images");
    setFiles([...files, ...valid].slice(0, 4 - existing.length));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) return toast.error("Enter the item name");
    if (!category) return toast.error("Choose a category");
    if (description.trim().length < 10)
      return toast.error("Description needs at least 10 characters");
    if (!(Number(price) > 0)) return toast.error("Enter a valid price");
    if (location.trim().length < 2) return toast.error("Enter the location");
    if (total === 0) return toast.error("Upload at least one image");

    setLoading(true);
    try {
      const uploaded = await Promise.all(files.map((f) => uploadToImgBB(f)));
      await onSubmit({
        itemName: name.trim(),
        category,
        description: description.trim(),
        price: Number(price),
        location: location.trim(),
        images: [...existing, ...uploaded],
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {notice}

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
            onValueChange={(v: string | null) => setCategory(v ?? "")}
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
          rows={4}
          placeholder="Ingredients, crust, size, what makes it special..."
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Images</Label>
          <span className="text-xs text-muted-foreground">
            {total}/4 · first image is the cover
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {existing.map((src, i) => (
            <div
              key={src}
              className="relative aspect-square overflow-hidden rounded-lg border border-border"
            >
              <img
                src={src}
                alt={`Image ${i + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  setExisting(existing.filter((_, idx) => idx !== i))
                }
                className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white hover:bg-tomato"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {previews.map((src, i) => (
            <div
              key={src}
              className="relative aspect-square overflow-hidden rounded-lg border border-primary/40"
            >
              <img
                src={src}
                alt={`New image ${i + 1}`}
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
          {total < 4 && (
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
            <Loader2 className="h-4 w-4 animate-spin" /> Uploading and saving...
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
}
