import { EssayToc } from "@/components/console/essay-toc";
import { Panel, Prompt } from "@/components/console/panel";
import { SiteShell } from "@/components/console/site-shell";
import { loadEssays } from "@/lib/essays";

export default function CoreBeliefsPage() {
  const essays = loadEssays();
  const index = essays.map(({ number, slug, fileName, title, minutes }) => ({ number, slug, fileName, title, minutes }));

  return (
    <SiteShell>
      <div className="lg:grid lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="border-b border-border lg:border-b-0 lg:border-r">
          <nav
            aria-label="Essays"
            className="px-4 py-5 md:px-6 lg:sticky lg:top-11 lg:max-h-[calc(100vh-2.75rem)] lg:overflow-y-auto"
          >
            <div className="mb-4 flex justify-between gap-3 text-[11px] uppercase tracking-[0.06em] text-dim">
              <span>
                <b className="text-foreground">ls</b> ./core-beliefs
              </span>
              <span>{essays.length} files</span>
            </div>
            <EssayToc essays={index} />
          </nav>
        </aside>

        <div className="min-w-0">
          <Panel
            title={<><b className="text-foreground">~/core-beliefs</b> — README.md</>}
            meta={<span className="text-signal">● living document</span>}
          >
            <Prompt path="~/core-beliefs">cat README.md</Prompt>
            <h1 className="mt-3 text-[clamp(2.25rem,5vw,3.75rem)] font-extrabold leading-none tracking-[-0.04em] [word-spacing:-0.18em]">
              Core Beliefs
            </h1>
            <p className="mt-5 max-w-[62ch] font-sans text-[17px] leading-relaxed">
              These are living essays — a record of convictions that keep surfacing in my work, my decisions, and the
              projects I can&apos;t stop thinking about. It will change as I change. The ideas below probably
              aren&apos;t finished. They&apos;re more like{" "}
              <span className="bg-sel px-1 text-foreground">directions</span>.
            </p>
          </Panel>

          {essays.map((essay) => (
            <article
              key={essay.slug}
              id={essay.slug}
              className="scroll-mt-24 border-t border-border px-4 py-8 md:px-6 md:py-10 lg:scroll-mt-11"
            >
              <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-[0.06em] text-dim">
                <span className="normal-case text-signal">{essay.fileName}</span>
                <span>{essay.minutes} min read</span>
                <a href={`#${essay.slug}`} className="hover:text-signal" aria-label={`Link to “${essay.title}”`}>
                  #
                </a>
              </div>
              <h2 className="mb-6 max-w-[28ch] text-2xl font-extrabold leading-tight tracking-[-0.03em] md:text-[2rem]">
                {essay.title}
              </h2>
              <div className="essay-body" dangerouslySetInnerHTML={{ __html: essay.html }} />
            </article>
          ))}

          {essays.length === 0 && (
            <Panel className="border-t border-border">
              <p className="text-dim">
                ls: ./core-beliefs: no essays yet. Drop an <code className="text-signal">NN-slug.md</code> file into{" "}
                <code className="text-signal">app/core-beliefs/essays/</code>.
              </p>
            </Panel>
          )}

          <Panel title={<><b className="text-foreground">cat</b> why-this-exists.txt</>} className="border-t border-border">
            <div className="max-w-[62ch] space-y-4 font-sans text-[15px] leading-relaxed">
              <p>
                These thoughts have bubbled up throughout my life and are starting to show up in all my personal work,
                whether I intend them to or not. Writing them down is an attempt at clarity — posting the here is an
                attempt at thinking in public.
              </p>
              <p className="text-dim">The essay is versionless on purpose — it&apos;s current, not complete.</p>
            </div>
          </Panel>
        </div>
      </div>
    </SiteShell>
  );
}
