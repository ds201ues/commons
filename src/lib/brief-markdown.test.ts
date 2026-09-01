/** @vitest-environment happy-dom */
import { describe, expect, it } from "vitest";
import { htmlToMarkdown, markdownToHtml } from "./brief-markdown";

describe("brief-markdown", () => {
  it("round-trips headings, lists, and inline marks", () => {
    const md = `# Title

**Bold** and _italic_ and \`code\`

- One
- Two`;
    const html = markdownToHtml(md);
    expect(html).toContain("<h3>");
    expect(html).toContain("<strong>Bold</strong>");
    expect(html).toContain("<em>italic</em>");
    expect(html).toContain("<ul>");

    const root = document.createElement("div");
    root.innerHTML = html;
    const back = htmlToMarkdown(root);
    expect(back).toContain("# Title");
    expect(back).toContain("**Bold**");
    expect(back).toContain("_italic_");
    expect(back).toContain("- One");
    expect(back).toContain("- Two");
  });

  it("returns empty for blank markdown", () => {
    expect(markdownToHtml("")).toBe("");
    expect(markdownToHtml("   ")).toBe("");
  });

  it("keeps a label line above a list as its own paragraph", () => {
    const html = markdownToHtml(`**Open questions**
- What do we need to agree on?
- What evidence would change our minds?`);
    expect(html).toContain("<p><strong>Open questions</strong></p>");
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>What do we need to agree on?</li>");
  });
});
