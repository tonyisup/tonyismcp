import fs from "fs";
import path from "path";

const ESSAYS_DIR = path.join(process.cwd(), "app/core-beliefs/essays");
const WORDS_PER_MINUTE = 230;

export interface EssayMeta {
  number: string;
  slug: string;
  fileName: string;
  title: string;
  minutes: number;
}

export interface Essay extends EssayMeta {
  html: string;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inlineMarkdown(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

// Minimal markdown-to-HTML: paragraphs, blockquotes, ## / ### headings, --- rules,
// a leading "TL;DR:" callout, bold and italic. Styling lives in `.essay-body`.
function markdownToHtml(md: string): string {
  const blocks: string[] = [];
  let quote: string[] = [];

  function flushQuote() {
    if (quote.length > 0) {
      blocks.push(`<blockquote>${inlineMarkdown(quote.join(" "))}</blockquote>`);
      quote = [];
    }
  }

  for (const line of md.split("\n")) {
    if (line.startsWith("> ")) {
      quote.push(line.slice(2));
      continue;
    }
    flushQuote();

    const trimmed = line.trim();
    if (trimmed === "") continue;

    if (/^-{3,}$/.test(trimmed)) {
      blocks.push("<hr />");
    } else if (trimmed.startsWith("### ")) {
      blocks.push(`<h4>${inlineMarkdown(trimmed.slice(4))}</h4>`);
    } else if (trimmed.startsWith("## ")) {
      blocks.push(`<h3>${inlineMarkdown(trimmed.slice(3))}</h3>`);
    } else if (/^TL;DR:/i.test(trimmed)) {
      blocks.push(`<p class="tldr"><b>tl;dr</b>${inlineMarkdown(trimmed.replace(/^TL;DR:\s*/i, ""))}</p>`);
    } else {
      blocks.push(`<p>${inlineMarkdown(line)}</p>`);
    }
  }
  flushQuote();

  return blocks.join("");
}

function readEssays() {
  return fs
    .readdirSync(ESSAYS_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((fileName) => {
      const content = fs.readFileSync(path.join(ESSAYS_DIR, fileName), "utf-8");
      const [firstLine, ...rest] = content.split("\n");
      const body = rest.join("\n").trim();
      const words = body.split(/\s+/).filter(Boolean).length;

      return {
        meta: {
          number: fileName.split("-")[0],
          slug: fileName.replace(/\.md$/, ""),
          fileName,
          title: firstLine.replace(/^#\s*/, "").trim(),
          minutes: Math.max(1, Math.ceil(words / WORDS_PER_MINUTE)),
        },
        body,
      };
    });
}

export function loadEssayIndex(): EssayMeta[] {
  return readEssays().map(({ meta }) => meta);
}

export function loadEssays(): Essay[] {
  return readEssays().map(({ meta, body }) => ({ ...meta, html: markdownToHtml(body) }));
}
