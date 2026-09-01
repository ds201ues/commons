/**
 * Narrow markdown ↔ HTML for the Commons brief.
 * Supports: #/##/### headings, paragraphs, - lists, **bold**, _italic_, `code`, [links](http…).
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatInlineHtml(text: string): string {
  const parts = text.split(/(\*\*[^*]+\*\*|_[^_]+_|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
  return parts
    .map((part) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return `<strong>${escapeHtml(part.slice(2, -2))}</strong>`;
      }
      if (part.startsWith("_") && part.endsWith("_")) {
        return `<em>${escapeHtml(part.slice(1, -1))}</em>`;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return `<code>${escapeHtml(part.slice(1, -1))}</code>`;
      }
      const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link) {
        const href = link[2] ?? "";
        if (/^https?:\/\//.test(href)) {
          return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link[1] ?? "")}</a>`;
        }
        return escapeHtml(link[1] ?? "");
      }
      return escapeHtml(part);
    })
    .join("");
}

function isListLine(line: string): boolean {
  return line.startsWith("- ") || line.startsWith("* ");
}

function headingHtml(line: string): string | null {
  if (line.startsWith("# ")) return `<h3>${formatInlineHtml(line.slice(2))}</h3>`;
  if (line.startsWith("## ")) return `<h4>${formatInlineHtml(line.slice(3))}</h4>`;
  if (line.startsWith("### ")) return `<h5>${formatInlineHtml(line.slice(4))}</h5>`;
  return null;
}

function flushParagraph(lines: string[]): string {
  const text = lines.join(" ").trim();
  return text ? `<p>${formatInlineHtml(text)}</p>` : "";
}

function flushList(lines: string[]): string {
  if (!lines.length) return "";
  const items = lines
    .map((line) => `<li>${formatInlineHtml(line.slice(2))}</li>`)
    .join("");
  return `<ul>${items}</ul>`;
}

/** Markdown → HTML string for contentEditable. */
export function markdownToHtml(markdown: string): string {
  const trimmed = (markdown ?? "").trim();
  if (!trimmed) return "";

  const out: string[] = [];
  let para: string[] = [];
  let list: string[] = [];

  const flushPara = () => {
    const html = flushParagraph(para);
    if (html) out.push(html);
    para = [];
  };
  const flushUl = () => {
    const html = flushList(list);
    if (html) out.push(html);
    list = [];
  };

  for (const raw of trimmed.split("\n")) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushPara();
      flushUl();
      continue;
    }

    const heading = headingHtml(line);
    if (heading) {
      flushPara();
      flushUl();
      out.push(heading);
      continue;
    }

    if (isListLine(line)) {
      flushPara();
      list.push(line);
      continue;
    }

    flushUl();
    para.push(line.trim());
  }

  flushPara();
  flushUl();
  return out.join("");
}

function inlineToMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? "";
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return "";

  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();
  const inner = Array.from(el.childNodes).map(inlineToMarkdown).join("");

  switch (tag) {
    case "strong":
    case "b":
      return inner ? `**${inner}**` : "";
    case "em":
    case "i":
      return inner ? `_${inner}_` : "";
    case "code":
      return inner ? `\`${inner}\`` : "";
    case "a": {
      const href = el.getAttribute("href") ?? "";
      if (/^https?:\/\//.test(href) && inner) return `[${inner}](${href})`;
      return inner;
    }
    case "br":
      return "\n";
    default:
      return inner;
  }
}

function blockToMarkdown(el: HTMLElement): string {
  const tag = el.tagName.toLowerCase();
  const inline = Array.from(el.childNodes).map(inlineToMarkdown).join("").trim();

  switch (tag) {
    case "h1":
    case "h2":
    case "h3":
      return inline ? `# ${inline}` : "";
    case "h4":
      return inline ? `## ${inline}` : "";
    case "h5":
    case "h6":
      return inline ? `### ${inline}` : "";
    case "ul": {
      const items = Array.from(el.children)
        .filter((child) => child.tagName.toLowerCase() === "li")
        .map((li) => {
          const text = Array.from(li.childNodes).map(inlineToMarkdown).join("").trim();
          return text ? `- ${text}` : null;
        })
        .filter(Boolean);
      return items.join("\n");
    }
    case "ol": {
      const items = Array.from(el.children)
        .filter((child) => child.tagName.toLowerCase() === "li")
        .map((li, index) => {
          const text = Array.from(li.childNodes).map(inlineToMarkdown).join("").trim();
          return text ? `${index + 1}. ${text}` : null;
        })
        .filter(Boolean);
      return items.join("\n");
    }
    case "p":
    case "div":
      return inline;
    case "blockquote":
      return inline ? `> ${inline}` : "";
    default:
      return inline;
  }
}

/** HTML element (contentEditable root) → markdown. */
export function htmlToMarkdown(root: HTMLElement): string {
  const blocks: string[] = [];

  for (const child of Array.from(root.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = (child.textContent ?? "").trim();
      if (text) blocks.push(text);
      continue;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) continue;
    const md = blockToMarkdown(child as HTMLElement);
    if (md) blocks.push(md);
  }

  return blocks.join("\n\n").trim();
}
