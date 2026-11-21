"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiFetch } from "@/lib/api";
import type { MenuItem } from "@/lib/types";

export function OrderDialog({
  item,
  open,
  onOpenChange,
}: {
  item: MenuItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [dateBounds] = useState(() => {
    const today = new Date();
    const maxDate = new Date(today.getTime() + 60 * 864e5);
    return {
      today: today.toLocaleDateString("en-CA"),
      maxDate: maxDate.toLocaleDateString("en-CA"),
    };
  });
  const [date, setDate] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return toast.error("Choose a delivery date");
    const today = new Date().toLocaleDateString("en-CA");
    if (date < today) return toast.error("Delivery date cannot be in the past");
    if (address.trim().length < 5)
      return toast.error("Enter your full delivery address");

    setLoading(true);
    try {
      await apiFetch("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          itemId: item._id,
          deliveryDate: date,
          deliveryAddress: address,
          message: note,
        }),
      });
      toast.success("Order placed! The restaurant will review it shortly.");
      setDate("");
      setAddress("");
      setNote("");
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not place the order",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">Place your order</DialogTitle>
          <DialogDescription>
            {item.itemName} from {item.vendor.name} ·{" "}
            <span className="tabular font-semibold text-foreground">
              ${item.price.toFixed(2)}
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Delivery Date</Label>
            <Input
              id="date"
              type="date"
              min={dateBounds?.today}
              max={dateBounds?.maxDate}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Delivery Address</Label>
            <Textarea
              id="address"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House, road, area, city"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">
              Special Instructions{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              placeholder="Extra crispy crust, no onions..."
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full font-bold glow-amber"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Placing order...
              </>
            ) : (
              "Confirm Order"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
