import Link from "next/link";
import { Caret, Panel, Prompt } from "@/components/console/panel";
import { SiteShell } from "@/components/console/site-shell";
import { loadEssayIndex } from "@/lib/essays";
import { EST_YEAR, PROJECTS, SOCIALS } from "@/lib/site";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const essays = loadEssayIndex();

  const stats = [
    { value: String(PROJECTS.length).padStart(2, "0"), label: "projects" },
    { value: String(essays.length).padStart(2, "0"), label: "essays" },
    { value: String(EST_YEAR), label: "est." },
    { value: "OK", label: "status", signal: true },
  ];

  return (
    <SiteShell>
      <div className="grid gap-px bg-border md:grid-cols-[1.6fr_1fr]">
        <Panel title={<><b className="text-foreground">~/tonyisup</b> — zsh</>} meta="tty01">
          <div className="space-y-2.5">
            <Prompt>whoami</Prompt>
            <h1 className="text-[clamp(2.25rem,6vw,4.25rem)] font-extrabold leading-none tracking-[-0.04em] [word-spacing:-0.18em]">
              Antonio
              <br />
              Villanueva
            </h1>
            <p className="font-sans text-[15px] text-dim">STEM · EDM · ENM · Gamer4Life</p>
            <Prompt>cat bio.txt</Prompt>
            <p className="max-w-[60ch] font-sans text-[15px] leading-relaxed">
              Tech enthusiast. Deeply empathetic, constantly analytical, endlessly creative. Hyper-aware of
              (mis)communication and psychology.
            </p>
            <Prompt>
              <Caret />
            </Prompt>
          </div>
        </Panel>

        <Panel title={<b className="text-foreground">sys.stats</b>} meta="live">
          <dl className="grid grid-cols-2 gap-px border border-border bg-border">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse bg-panel p-3">
                <dt className="text-[11px] uppercase text-dim">{s.label}</dt>
                <dd className={cn("text-[26px] font-extrabold tracking-[-0.03em]", s.signal && "text-signal")}>
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 font-sans text-sm text-dim">
            ethos →{" "}
            <em className="bg-sel px-1 not-italic text-foreground">Everything is a learning experience.</em> Help
            others. Fail eagerly.
          </p>
        </Panel>
      </div>

      <div className="grid gap-px border-t border-border bg-border md:grid-cols-[1.6fr_1fr] xl:grid-cols-[1.6fr_1fr_0.8fr]">
        <Panel id="work" title={<><b className="text-foreground">ps</b> --projects</>} meta={`${PROJECTS.length} procs`}>
          <div role="table" aria-label="Projects" className="text-[13px]">
            <div
              role="row"
              className="grid grid-cols-[2.5rem_1fr_4.5rem] gap-x-3 border-b border-border pb-2 text-[11px] uppercase tracking-[0.06em] text-dim md:grid-cols-[2.5rem_1fr_7rem_4.5rem]"
            >
              <span role="columnheader" className="pl-2">pid</span>
              <span role="columnheader">name</span>
              <span role="columnheader" className="hidden md:block">type</span>
              <span role="columnheader">status</span>
            </div>
            {PROJECTS.map((p, i) => (
              <Link
                key={p.slug}
                href={p.href}
                role="row"
                target={p.external ? "_blank" : undefined}
                rel={p.external ? "noopener noreferrer" : undefined}
                className="group grid grid-cols-[2.5rem_1fr_4.5rem] gap-x-3 border-b border-dashed border-border py-3 transition-colors hover:bg-sel hover:shadow-[inset_2px_0_0_var(--signal)] md:grid-cols-[2.5rem_1fr_7rem_4.5rem]"
              >
                <span role="cell" className="pl-2 text-dim">{String(i + 1).padStart(2, "0")}</span>
                <span role="cell" className="min-w-0">
                  <span className="font-bold group-hover:text-signal">{p.slug}</span>
                  <span className="mt-0.5 block font-sans text-[13px] text-dim">{p.description}</span>
                </span>
                <span role="cell" className="hidden text-dim md:block">{p.type}</span>
                <span role="cell" className="whitespace-nowrap">
                  <span className={p.external ? "text-signal" : "text-ok"}>{p.external ? "↗" : "●"}</span> {p.status}
                </span>
              </Link>
            ))}
          </div>
        </Panel>

        <Panel id="beliefs" title={<><b className="text-foreground">ls</b> ./core-beliefs</>} meta={`${essays.length} files`}>
          <ul className="text-[13px]">
            {essays.map((e) => (
              <li key={e.slug}>
                <Link
                  href={`/core-beliefs#${e.slug}`}
                  title={e.title}
                  className="group -mx-2 grid grid-cols-[auto_1fr_auto] gap-3 rounded-sm px-2 py-1.5 hover:bg-sel"
                >
                  <span className="text-dim">-rw</span>
                  <span className="truncate group-hover:text-signal">{e.fileName}</span>
                  <span className="text-right text-dim">{e.minutes}m</span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title={<b className="text-foreground">links</b>} meta="ext" className="md:col-span-2 xl:col-span-1">
          <ul className="grid gap-x-6 text-[13px] md:grid-cols-3 xl:grid-cols-1">
            {SOCIALS.map((s) => (
              <li key={s.key}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex justify-between gap-3 border-b border-dashed border-border py-1.5"
                >
                  <span className="text-dim">{s.key}</span>
                  <span className="group-hover:text-signal">{s.label} ↗</span>
                </a>
              </li>
            ))}
            <li>
              <Link href="/resume" className="group flex justify-between gap-3 border-b border-dashed border-border py-1.5">
                <span className="text-dim">cv</span>
                <span className="group-hover:text-signal">resume →</span>
              </Link>
            </li>
          </ul>
        </Panel>
      </div>
    </SiteShell>
  );
}
