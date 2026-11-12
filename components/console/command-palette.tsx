"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import type { EssayMeta } from "@/lib/essays";
import { NAV, PROJECTS, SOCIALS } from "@/lib/site";
import { cn } from "@/lib/utils";
import { kbdClass } from "./kbd";

interface Command {
  id: string;
  label: string;
  group: string;
  hint?: string;
  run: () => void;
}

const PaletteContext = createContext<{ open: () => void } | null>(null);

function usePalette() {
  const ctx = useContext(PaletteContext);
  if (!ctx) throw new Error("usePalette must be used inside CommandPaletteProvider");
  return ctx;
}

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return !!el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));
}

// Owns the ⌘K palette and the site-wide shortcuts: ⌘K / ctrl+K and "/" open it,
// 1–4 jump to the primary nav items.
export function CommandPaletteProvider({ essays, children }: { essays: EssayMeta[]; children: React.ReactNode }) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const commands = useMemo<Command[]>(() => {
    const go = (href: string) => () => router.push(href);
    const ext = (href: string) => () => window.open(href, "_blank", "noopener,noreferrer");

    return [
      ...NAV.map((n) => ({ id: `go-${n.label}`, label: n.label, group: "go", hint: n.key, run: go(n.href) })),
      { id: "go-certificates", label: "certificates", group: "go", run: go("/resume/certificates") },
      ...essays.map((e) => ({
        id: `read-${e.slug}`,
        label: `${e.number} ${e.title}`,
        group: "read",
        hint: `${e.minutes}m`,
        run: go(`/core-beliefs#${e.slug}`),
      })),
      ...(["light", "dark", "system"] as const).map((t) => ({
        id: `theme-${t}`,
        label: `theme ${t === "system" ? "auto" : t}`,
        group: "set",
        run: () => setTheme(t),
      })),
      ...PROJECTS.filter((p) => p.external).map((p) => ({
        id: `open-${p.slug}`,
        label: p.slug,
        group: "open",
        hint: "↗",
        run: ext(p.href),
      })),
      ...SOCIALS.map((s) => ({ id: `open-${s.key}`, label: s.label, group: "open", hint: "↗", run: ext(s.href) })),
      { id: "open-resume-pdf", label: "resume.pdf", group: "open", hint: "↗", run: ext("/Resume.pdf") },
    ];
  }, [essays, router, setTheme]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((o) => !o);
        return;
      }
      if (isOpen || isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "/") {
        e.preventDefault();
        setIsOpen(true);
        return;
      }
      const nav = NAV.find((n) => n.key === e.key);
      if (nav) router.push(nav.href);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, router]);

  return (
    <PaletteContext.Provider value={{ open }}>
      {children}
      {isOpen && <PaletteDialog commands={commands} onClose={close} />}
    </PaletteContext.Provider>
  );
}

function PaletteDialog({ commands, onClose }: { commands: Command[]; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? commands.filter((c) => `${c.group} ${c.label}`.toLowerCase().includes(q)) : commands;
  }, [commands, query]);
  const active = Math.min(selected, Math.max(shown.length - 1, 0));

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    return () => previous?.focus?.();
  }, []);

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [active, shown]);

  function run(command: Command) {
    onClose();
    command.run();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "Tab") {
      e.preventDefault(); // the input is the only focus stop
    } else if (e.key === "ArrowDown" && shown.length) {
      e.preventDefault();
      setSelected((active + 1) % shown.length);
    } else if (e.key === "ArrowUp" && shown.length) {
      e.preventDefault();
      setSelected((active - 1 + shown.length) % shown.length);
    } else if (e.key === "Enter" && shown[active]) {
      e.preventDefault();
      run(shown[active]);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/45 px-4 pt-[12vh]"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onKeyDown={onKeyDown}
        className="w-full max-w-xl overflow-hidden rounded-lg border border-border bg-panel shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b border-border px-4">
          <span className="text-signal" aria-hidden>
            ›
          </span>
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={shown[active] ? `cmd-${shown[active].id}` : undefined}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(0);
            }}
            placeholder="type a command or search essays…"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-dim"
          />
        </div>
        <ul id="palette-list" role="listbox" ref={listRef} className="max-h-80 overflow-y-auto p-1.5">
          {shown.length === 0 && <li className="px-3 py-2 text-[13px] text-dim">no matches</li>}
          {shown.map((c, i) => (
            <li
              key={c.id}
              id={`cmd-${c.id}`}
              role="option"
              aria-selected={i === active}
              onMouseMove={() => i !== active && setSelected(i)}
              onClick={() => run(c)}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-4 rounded px-3 py-2 text-[13px]",
                i === active && "bg-sel"
              )}
            >
              <span className="truncate">
                <span className={cn("mr-1", i === active ? "text-signal" : "text-transparent")}>›</span>
                {c.label}
              </span>
              <span className="shrink-0 text-[11px] text-dim">
                {c.group}
                {c.hint && ` · ${c.hint}`}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex gap-4 border-t border-border px-4 py-2 text-[11px] text-dim">
          <span>↑↓ move</span>
          <span>↵ run</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}

export function PaletteTrigger({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { open } = usePalette();
  return (
    <button type="button" onClick={open} aria-label={label} className={cn(kbdClass, "hover:text-foreground", className)}>
      {children}
    </button>
  );
}
