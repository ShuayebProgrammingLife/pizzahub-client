"use client";
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export function useAdminList<T>(path: string, params: Record<string, string | number>) {
  const [data, setData] = useState<T | null>(null);
  const [requestResult, setRequestResult] = useState<{ id: string; error: string } | null>(null);
  const [tick, setTick] = useState(0);
  const key = JSON.stringify(params);
  const requestId = JSON.stringify([path, key, tick]);

  useEffect(() => {
    let alive = true;
    const qs = new URLSearchParams();
    Object.entries(JSON.parse(key) as Record<string, string | number>).forEach(([k, v]) => {
      if (v !== "" && v !== undefined) qs.set(k, String(v));
    });
    apiFetch<T>(`${path}?${qs.toString()}`)
      .then((d) => {
        if (!alive) return;
        setData(d);
        setRequestResult({ id: requestId, error: "" });
      })
      .catch((e: unknown) => {
        if (!alive) return;
        setRequestResult({
          id: requestId,
          error: e instanceof Error ? e.message : "Could not load data",
        });
      });
    return () => {
      alive = false;
    };
  }, [path, key, requestId]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  const loading = requestResult?.id !== requestId;
  const error = requestResult?.id === requestId ? requestResult.error : "";
  return { data, error, loading, reload };
}