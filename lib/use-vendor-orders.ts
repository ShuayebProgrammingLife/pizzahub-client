"use client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import type { VendorOrder } from "@/lib/types";

export function useVendorOrders(status?: string, onChanged?: () => void) {
  const [orders, setOrders] = useState<VendorOrder[] | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    apiFetch<{ orders: VendorOrder[] }>(`/api/orders/vendor${status ? `?status=${status}` : ""}`)
      .then((d) => {
        if (alive) {
          setError("");
          setOrders(d.orders);
        }
      })
      .catch((e: unknown) => alive && setError(e instanceof Error ? e.message : "Could not load orders"));
    return () => {
      alive = false;
    };
  }, [status, tick]);

  const reload = useCallback(() => {
    setOrders(null);
    setTick((t) => t + 1);
  }, []);

  async function act(id: string, next: "accepted" | "rejected") {
    setBusyId(id);
    try {
      await apiFetch(`/api/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status: next }) });
      toast.success(next === "accepted" ? "Order accepted" : "Order rejected");
      setOrders((prev) =>
        prev
          ? status === "pending"
            ? prev.filter((o) => o._id !== id)
            : prev.map((o) => (o._id === id ? { ...o, status: next } : o))
          : prev
      );
      onChanged?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update the order");
      setTick((t) => t + 1); // re-sync with the server
    } finally {
      setBusyId(null);
    }
  }

  return { orders, error, busyId, act, reload };
}