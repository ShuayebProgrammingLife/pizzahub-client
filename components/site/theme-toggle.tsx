"use client";
import { Moon, Sun } from "lucide-react";
import { setDarkMode, useIsDark } from "@/lib/use-theme";
import { cn } from "@/lib/utils";

export function ThemeToggle({
  className,
  showLabel,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const dark = useIsDark();
  return (
    <button
      type="button"
      onClick={() => setDarkMode(!dark)}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md p-2 text-on-surface-variant transition hover:bg-surface-high hover:text-foreground",
        className,
      )}
    >
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      {showLabel && (
        <span className="text-sm font-semibold">
          {dark ? "Light mode" : "Dark mode"}
        </span>
      )}
    </button>
  );
}
