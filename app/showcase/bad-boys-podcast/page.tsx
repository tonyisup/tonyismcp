import { Panel, Prompt } from "@/components/console/panel";
import { SiteShell } from "@/components/console/site-shell";
import { TermLink } from "@/components/console/term-link";

const TAGS = ["podcast-engineering", "audio-editing", "content-creation", "web-development"];

const MOMENTS = [
  {
    file: "01-rss-feed-management.md",
    title: "RSS Feed Management",
    body: "One of the key technical challenges was understanding and customizing the RSS feed to ensure compatibility with various podcast platforms like Apple Podcasts and Spotify. Structure and XML validation were crucial.",
    lang: "feed.xml",
    code: `<item>
  <title>Episode 100: The Milestone</title>
  <description>We celebrate 100 episodes...</description>
  <enclosure url="https://example.com/ep100.mp3" length="12345678" type="audio/mpeg" />
  <guid>https://example.com/ep100</guid>
  <pubDate>Tue, 14 Mar 2023 12:00:00 GMT</pubDate>
  <itunes:duration>1:05:23</itunes:duration>
</item>`,
  },
  {
    file: "02-audio-engineering-workflow.md",
    title: "Audio Engineering Workflow",
    body: "Consistency is key. Developing a reliable workflow for recording, editing, mixing, and mastering significantly reduced production time. Automation scripts were eventually introduced to handle file naming and metadata tagging.",
    lang: "tag.sh",
    code: `# Example Bash script for tagging
ffmpeg -i input.wav \\
  -metadata title="Episode Title" \\
  -metadata artist="Bad Boys Podcast" \\
  -codec:a libmp3lame -q:a 2 \\
  output.mp3`,
  },
];

export default function BadBoysPodcastShowcase() {
  return (
    <SiteShell>
      <Panel
        title={<><b className="text-foreground">~/projects/bad-boys-podcast</b> — README.md</>}
        meta={<span><span className="text-ok">●</span> weekly</span>}
      >
        <Prompt path="~/projects">cat bad-boys-podcast/README.md</Prompt>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-none tracking-[-0.04em] [word-spacing:-0.18em]">
            Bad Boys Podcast
          </h1>
          <TermLink href="https://badboyspodcast.com" external>
            visit live site ↗
          </TermLink>
        </div>
        <p className="mt-5 max-w-[60ch] font-sans text-[17px] leading-relaxed">
          Co-hosting and engineering a weekly podcast about movies and pop culture. Over 10 years of content!
        </p>
        <ul className="mt-5 flex flex-wrap gap-2 text-xs">
          {TAGS.map((tag) => (
            <li key={tag} className="rounded border border-border bg-panel px-2 py-1 text-dim">
              #{tag}
            </li>
          ))}
        </ul>
      </Panel>

      <div className="grid gap-px border-t border-border bg-border lg:grid-cols-[1fr_1.4fr]">
        <Panel title={<><b className="text-foreground">cat</b> overview.md</>}>
          <h2 className="mb-4 text-xl font-extrabold tracking-[-0.02em]">Overview</h2>
          <p className="font-sans text-[15px] leading-relaxed">
            The Bad Boys Podcast is a long-running project that started as a simple conversation between friends and
            evolved into a weekly production. Beyond just recording, it involves managing RSS feeds, website
            maintenance, and ensuring high-quality audio engineering. It has been a playground for learning about
            digital media distribution and building a community around content.
          </p>
        </Panel>

        <Panel title={<><b className="text-foreground">ls</b> ./learning-moments</>} meta={`${MOMENTS.length} files`}>
          <div className="space-y-8">
            {MOMENTS.map((m) => (
              <article key={m.file}>
                <p className="mb-1 text-[11px] text-signal">{m.file}</p>
                <h3 className="mb-3 text-lg font-extrabold tracking-[-0.02em]">{m.title}</h3>
                <p className="mb-4 font-sans text-[15px] leading-relaxed">{m.body}</p>
                <figure className="overflow-hidden rounded border border-border bg-panel">
                  <figcaption className="border-b border-border px-3 py-1.5 text-[11px] text-dim">{m.lang}</figcaption>
                  <pre className="overflow-x-auto p-3 text-xs leading-relaxed">
                    <code>{m.code}</code>
                  </pre>
                </figure>
              </article>
            ))}
          </div>
        </Panel>
      </div>
    </SiteShell>
  );
}
