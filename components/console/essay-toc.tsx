"use client";

import { useEffect, useState } from "react";
import type { EssayMeta } from "@/lib/essays";
import { cn } from "@/lib/utils";

// `ls`-style essay index that highlights the essay currently in view.
export function EssayToc({ essays }: { essays: EssayMeta[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = essays
      .map((e) => document.getElementById(e.slug))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) setActive(visible[visible.length - 1].target.id);
      },
      { rootMargin: "-15% 0px -75% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [essays]);

  return (
    <ol className="text-[13px]">
      {essays.map((e) => {
        const current = e.slug === active;
        return (
          <li key={e.slug}>
            <a
              href={`#${e.slug}`}
              title={e.title}
              aria-current={current ? "location" : undefined}
              className={cn(
                "group -mx-2 grid grid-cols-[auto_1fr_auto] gap-3 rounded-sm px-2 py-1.5 transition-colors hover:bg-sel",
                current && "bg-sel shadow-[inset_2px_0_0_var(--signal)]"
              )}
            >
              <span className="text-dim">-rw</span>
              <span className={cn("truncate group-hover:text-signal", current && "text-signal")}>{e.fileName}</span>
              <span className="text-right text-dim">{e.minutes}m</span>
            </a>
          </li>
        );
      })}
    </ol>
  );
}
