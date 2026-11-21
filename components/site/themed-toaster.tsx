"use client";
import { Toaster } from "sonner";
import { useIsDark } from "@/lib/use-theme";

export function ThemedToaster() {
  const dark = useIsDark();
  return (
    <Toaster theme={dark ? "dark" : "light"} richColors position="top-right" />
  );
}
