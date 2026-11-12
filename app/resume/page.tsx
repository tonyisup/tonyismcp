import { Panel, Prompt } from "@/components/console/panel";
import { SiteShell } from "@/components/console/site-shell";
import { TermLink } from "@/components/console/term-link";

export default function ResumePage() {
  return (
    <SiteShell>
      <Panel
        title={<><b className="text-foreground">~/resume</b> — Resume.pdf</>}
        meta="last updated: feb 2026"
      >
        <Prompt path="~/resume">open Resume.pdf</Prompt>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-[clamp(2rem,5vw,3.25rem)] font-extrabold leading-none tracking-[-0.04em] [word-spacing:-0.18em]">Resume</h1>
          <div className="flex flex-wrap gap-2">
            <TermLink href="/resume/certificates">certificates →</TermLink>
            <TermLink href="/Resume.pdf" download="Antonio_Villanueva_Resume.pdf">
              download ↓
            </TermLink>
            <TermLink href="/Resume.pdf" external>
              open in new tab ↗
            </TermLink>
          </div>
        </div>
      </Panel>

      <div className="border-t border-border bg-panel p-2 md:p-4">
        <iframe
          src="/Resume.pdf"
          title="Antonio Villanueva Resume"
          className="h-[calc(100vh-260px)] min-h-[600px] w-full rounded border border-border bg-white"
        />
        <p className="mt-3 text-center text-[11px] text-dim">
          If the PDF doesn&apos;t load properly, try downloading it or opening it in a new tab.
        </p>
      </div>
    </SiteShell>
  );
}
