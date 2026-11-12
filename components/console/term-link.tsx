import Link from "next/link";
import { cn } from "@/lib/utils";

interface TermLinkProps {
  href: string;
  external?: boolean;
  download?: string;
  className?: string;
  children: React.ReactNode;
}

// Bordered, monospace action link — the console's button.
export function TermLink({ href, external, download, className, children }: TermLinkProps) {
  const classes = cn(
    "inline-flex items-center gap-2 rounded border border-border bg-panel px-3 py-1.5 text-xs transition-colors hover:border-signal hover:text-signal focus-visible:outline-2 focus-visible:outline-signal",
    className
  );

  if (external || download) {
    return (
      <a
        href={href}
        className={classes}
        download={download}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
