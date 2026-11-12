import { loadEssayIndex } from "@/lib/essays";
import { CommandPaletteProvider, PaletteTrigger } from "./command-palette";
import { SiteHeader } from "./site-header";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const essays = loadEssayIndex();

  return (
    <CommandPaletteProvider essays={essays}>
      <div className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-14 focus:z-50 focus:rounded focus:bg-signal-bg focus:px-3 focus:py-1.5 focus:text-xs focus:text-black"
        >
          skip to content
        </a>
        <SiteHeader />
        <main id="main" className="mx-auto w-full max-w-[1440px] flex-1 border-border min-[1441px]:border-x">
          {children}
        </main>
        <footer className="border-t border-border">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1.5 px-4 py-2.5 text-[11px] text-dim">
            <span>
              <span className="text-ok">●</span> all systems operational
            </span>
            <span className="hidden md:inline">
              press <PaletteTrigger label="Open command palette">⌘K</PaletteTrigger> or{" "}
              <PaletteTrigger label="Open command palette">/</PaletteTrigger> to navigate
            </span>
            <span>© {new Date().getFullYear()} tonyisup</span>
          </div>
        </footer>
      </div>
    </CommandPaletteProvider>
  );
}
