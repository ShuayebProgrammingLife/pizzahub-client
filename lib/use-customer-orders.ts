"use client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import type { CustomerOrder } from "@/lib/types";

export function useCustomerOrders(opts: { status?: string; limit?: number } = {}) {
  const { status, limit } = opts;
  const [orders, setOrders] = useState<CustomerOrder[] | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    const qs = new URLSearchParams();
    if (status) qs.set("status", status);
    if (limit) qs.set("limit", String(limit));
    const q = qs.toString();
    apiFetch<{ orders: CustomerOrder[] }>(`/api/orders/mine${q ? `?${q}` : ""}`)
      .then((d) => {
        if (!alive) return;
        setError("");
        setOrders(d.orders);
      })
      .catch((e: unknown) => alive && setError(e instanceof Error ? e.message : "Could not load your orders"));
    return () => {
      alive = false;
    };
  }, [status, limit, tick]);

  const reload = useCallback(() => {
    setOrders(null);
    setTick((t) => t + 1);
  }, []);

  async function cancel(id: string): Promise<boolean> {
    setBusyId(id);
    try {
      await apiFetch(`/api/orders/${id}/cancel`, { method: "PATCH" });
      toast.success("Order cancelled");
      setOrders((prev) =>
        prev
          ? prev.map((o) =>
            o._id === id ? { ...o, status: "cancelled", cancelledAt: new Date().toISOString() } : o
          )
          : prev
      );
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not cancel the order");
      setTick((t) => t + 1); // re-sync: the vendor may have responded first
      return false;
    } finally {
      setBusyId(null);
    }
  }

  return { orders, error, busyId, cancel, reload };
}