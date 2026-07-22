export type TocEntry = {
  id: string;
  text: string;
  depth: 2 | 3;
};

function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const HEADING_RE = /^(#{2,3})\s+(.+)$/gm;

// remark-html doesn't add id attributes to headings on its own, so the TOC
// and the rendered HTML need to agree on the same slugs independently. Both
// this function and addHeadingIds() below derive ids from the raw Markdown
// heading text the same way, so links from one line up with anchors in the other.
export function extractTableOfContents(markdown: string): TocEntry[] {
  const entries: TocEntry[] = [];
  for (const match of markdown.matchAll(HEADING_RE)) {
    const depth = match[1].length as 2 | 3;
    const text = match[2].trim();
    entries.push({ id: slugifyHeading(text), text, depth });
  }
  return entries;
}

// Injects id="..." into each <h2>/<h3> in rendered HTML, matching the slugs
// extractTableOfContents() produced from the same source Markdown.
export function addHeadingIds(html: string): string {
  return html.replace(
    /<(h[23])>(.*?)<\/\1>/g,
    (fullMatch, tag, inner) => {
      const text = inner.replace(/<[^>]+>/g, "").trim();
      const id = slugifyHeading(text);
      return `<${tag} id="${id}">${inner}</${tag}>`;
    },
  );
}
