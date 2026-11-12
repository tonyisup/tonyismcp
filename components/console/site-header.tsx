"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Clock } from "./clock";
import { PaletteTrigger } from "./command-palette";
import { ThemeRadio } from "./theme-radio";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SiteHeader() {
  const pathname = usePathname();

  const links = NAV.map((n) => {
    const active = isActive(pathname, n.href);
    return (
      <Link
        key={n.href}
        href={n.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "whitespace-nowrap transition-colors hover:text-signal",
          active ? "text-foreground underline decoration-signal underline-offset-4" : "text-dim"
        )}
      >
        <span className="hidden text-dim lg:inline">[{n.key}] </span>
        {n.label}
      </Link>
    );
  });

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="flex h-11 items-center gap-4 px-4 text-xs">
        <Link href="/" className="inline-flex shrink-0 items-center gap-2 font-extrabold">
          <span aria-hidden className="size-2 rounded-full bg-ok shadow-[0_0_8px_var(--ok)]" />
          tonyisup<span className="font-normal text-dim">.sys</span>
        </Link>
        <nav aria-label="Primary" className="hidden gap-4 md:flex">
          {links}
        </nav>
        <span className="flex-1" />
        <Clock className="hidden tabular-nums text-dim lg:inline" />
        <PaletteTrigger label="Open command palette" className="hidden md:inline-block">
          ⌘K
        </PaletteTrigger>
        <ThemeRadio />
      </div>
      <nav aria-label="Primary" className="flex gap-5 overflow-x-auto border-t border-border px-4 py-2 text-xs md:hidden">
        {links}
      </nav>
    </header>
  );
}
