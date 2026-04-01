import fs from "fs";
import path from "path";
import { ArrowLeft, Clock } from "lucide-react";
import { BrutalistButton } from "@/components/ui/brutalist-button";

interface Essay {
  number: string;
  slug: string;
  title: string;
  html: string;
}

// Minimal markdown-to-HTML converter (handles headers, bold, italic, em-dashes, quotes, paragraphs)
function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  const htmlBlocks: string[] = [];
  let inBlockquote = false;
  let blockquoteLines: string[] = [];

  function flushBlockquote() {
    if (blockquoteLines.length > 0) {
      const inner = blockquoteLines.join("\n");
      const processed = inlineMarkdown(inner);
      htmlBlocks.push(
        `<blockquote class="text-sm font-bold opacity-70 italic border-l-[3px] border-yellow-400 pl-4 my-3">${processed}</blockquote>`
      );
      blockquoteLines = [];
      inBlockquote = false;
    }
  }

  function inlineMarkdown(text: string): string {
    // Bold (**text**)
    text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    // Italic (*text*)
    text = text.replace(/\*(.+?)\*/g, "<em>$1</em>");
    return text;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Blockquote
    if (line.startsWith("> ")) {
      inBlockquote = true;
      blockquoteLines.push(line.slice(2));
      continue;
    } else if (inBlockquote) {
      flushBlockquote();
    }

    // Empty line
    if (line.trim() === "") {
      continue;
    }

    // Already HTML header (we don't generate those above)
    if (line.match(/^<h/)) {
      htmlBlocks.push(line);
      continue;
    }

    // Regular paragraph text
    htmlBlocks.push(
      `<p class="mb-4 leading-relaxed">${inlineMarkdown(line)}</p>`
    );
  }

  if (inBlockquote) flushBlockquote();

  return htmlBlocks.join("");
}

function loadEssays(): Essay[] {
  const essaysDir = path.join(process.cwd(), "app/core-beliefs/essays");
  const files = fs
    .readdirSync(essaysDir)
    .filter((f) => f.endsWith(".md"))
    .sort();

  return files.map((file) => {
    const content = fs.readFileSync(path.join(essaysDir, file), "utf-8");
    const firstLine = content.split("\n")[0];
    const title = firstLine.replace(/^#\s*/, "").trim();
    const body = content.split("\n").slice(1).join("\n").trim();
    const number = file.split("-")[0];
    const slug = file.replace(/\.md$/, "");

    return { number, slug, title, html: markdownToHtml(body) };
  });
}

export default function CoreBeliefsPage() {
  const essays = loadEssays();

  return (
    <main className="min-h-screen bg-white text-black font-mono p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-[4px] border-black pb-8 mb-10">
          <div>
            <BrutalistButton href="/" className="text-sm px-4 py-2 mb-4 inline-block">
              <ArrowLeft className="h-4 w-4 inline mr-2" />
              Back to Home
            </BrutalistButton>
            <h1 className="text-4xl md:text-6xl font-black uppercase">Core Beliefs</h1>
          </div>
          <div className="bg-black text-white px-3 py-1 border-[2px] border-black text-sm font-bold whitespace-nowrap flex items-center gap-2">
            <Clock className="h-4 w-4" />
            LIVING DOCUMENT
          </div>
        </div>

        {/* Introduction */}
        <section className="mb-12">
          <div className="bg-yellow-400 border-[3px] border-black p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
            <p className="font-bold text-lg leading-relaxed">
              This is a living essay — a record of convictions that keep surfacing in my work, my decisions, and the projects I can&apos;t stop thinking about. It will change as I change. The ideas below aren&apos;t finished. They&apos;re{" "}
              <span className="underline decoration-[4px] decoration-black">directions</span>.
            </p>
            <p className="font-bold text-sm mt-4 opacity-75">
              Each belief is its own file. Edit them independently, draft without distraction. The page stitches them into one scroll.
            </p>
          </div>
        </section>

        {/* Table of contents */}
        {essays.length > 0 && (
          <nav className="mb-14 border-[3px] border-black p-4 bg-gray-50 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <h2 className="text-sm font-black uppercase bg-black text-white px-2 py-1 inline-block mb-4">
              Essays
            </h2>
            <ol className="space-y-1 text-sm font-bold">
              {essays.map((essay) => (
                <li key={essay.slug}>
                  <a
                    href={`#${essay.slug}`}
                    className="hover:underline decoration-2 decoration-yellow-400"
                  >
                    {essay.number}. {essay.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Essays */}
        {essays.map((essay, index) => (
          <section
            key={essay.slug}
            id={essay.slug}
            className={`mb-16 ${
              index > 0 ? "border-t-[3px] border-black pt-12" : ""
            }`}
          >
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-black uppercase">
                <span className="bg-black text-white px-2 py-0.5 mr-2 inline-block">
                  {essay.number}
                </span>
                {essay.title}
              </h2>
            </div>
            <div
              className="text-base font-bold"
              dangerouslySetInnerHTML={{ __html: essay.html }}
            />
          </section>
        ))}

        {essays.length === 0 && (
          <div className="border-[3px] border-black border-dashed p-8 text-center mb-12">
            <p className="font-bold text-lg">No essays yet.</p>
            <p className="text-sm mt-2 opacity-70">
              Drop a <code className="bg-yellow-400 px-1 border-[2px] border-black">NN-slug.md</code> file into{" "}
              <code className="bg-yellow-400 px-1 border-[2px] border-black">app/core-beliefs/essays/</code> to get started.
            </p>
          </div>
        )}

        {/* Closing */}
        <section className="mt-16 mb-12">
          <div className="border-[3px] border-black p-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)] bg-yellow-50">
            <h2 className="text-xl font-black uppercase bg-black text-white px-2 py-1 inline-block mb-4">
              Why This Exists
            </h2>
            <p className="font-bold leading-relaxed mb-4">
              These beliefs show up in everything I build, whether I intend them to
              or not. Writing them down is an attempt at clarity — not finality.
              If I come back in six months and half of these look naive,
              that&apos;s a success.
            </p>
            <p className="font-bold leading-relaxed">
              The essay is versionless on purpose — it&apos;s current, not complete.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
