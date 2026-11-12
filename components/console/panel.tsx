import { cn } from "@/lib/utils";

interface PanelProps {
  id?: string;
  title?: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

// One cell of the console grid. Place panels inside a `grid gap-px bg-border`
// container so the 1px gaps read as hairline dividers.
export function Panel({ id, title, meta, className, children }: PanelProps) {
  return (
    <section
      id={id}
      className={cn("min-w-0 scroll-mt-24 bg-background px-4 py-5 md:scroll-mt-14 md:px-6 md:py-6", className)}
    >
      {(title || meta) && (
        <div className="mb-4 flex justify-between gap-3 text-[11px] uppercase tracking-[0.06em] text-dim">
          <span className="min-w-0 truncate">{title}</span>
          {meta && <span className="shrink-0">{meta}</span>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Prompt({ path = "~/tonyisup", children }: { path?: string; children?: React.ReactNode }) {
  return (
    <p className="text-[13px]">
      <span className="text-signal">{path} $</span> {children}
    </p>
  );
}

export function Caret() {
  return (
    <span
      aria-hidden
      className="inline-block h-[1.1em] w-[0.6em] animate-caret bg-signal align-[-0.2em]"
    />
  );
}
