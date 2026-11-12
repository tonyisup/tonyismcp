"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "light" },
  { value: "dark", label: "dark" },
  { value: "system", label: "auto" },
];

export function ThemeRadio({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  // The stored theme is only known on the client; render unselected until mounted.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div role="group" aria-label="Color theme" className={cn("inline-flex items-center gap-0.5", className)}>
      <span className="mr-1 hidden text-dim lg:inline">theme:</span>
      {OPTIONS.map((option) => {
        const active = mounted && theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => setTheme(option.value)}
            className={cn(
              "whitespace-nowrap rounded-sm px-1.5 py-0.5 transition-colors focus-visible:outline-1 focus-visible:outline-signal",
              active ? "bg-sel text-foreground" : "text-dim hover:text-foreground"
            )}
          >
            <span className={active ? "text-signal" : undefined}>{active ? "(•)" : "( )"}</span> {option.label}
          </button>
        );
      })}
    </div>
  );
}
