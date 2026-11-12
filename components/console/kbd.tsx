import { cn } from "@/lib/utils";

export const kbdClass =
  "rounded border border-b-2 border-border bg-panel px-1.5 py-px font-mono text-[11px] text-dim";

export function Kbd({ className, children }: { className?: string; children: React.ReactNode }) {
  return <kbd className={cn(kbdClass, className)}>{children}</kbd>;
}
