import fs from "fs";
import { join } from "path";
import renderMarkdown from "@/lib/renderMarkdown";
import { withBasePath } from "@/lib/base-path";

// Matches a standalone "<!-- include: filename.html -->" line.
const INCLUDE_RE = /^<!--\s*include:\s*(\S+)\s*-->$/m;

// A five-column specifications table doesn't fit a phone. Wrapping it lets the
// table scroll on its own rather than stretching the whole article.
function wrapTablesForScrolling(rawHtml: string) {
  return rawHtml
    .replace(/<table\b/g, '<div data-table-scroll><table')
    .replace(/<\/table>/g, "</table></div>");
}

// Tag the "Figure 1:"/"Table 1:" prefix so it can be styled as a label. Tables
// authored by gt already ship one inside <caption>; figcaptions are written by
// hand and don't.
function labelFigureCaptions(rawHtml: string) {
  return rawHtml.replace(
    /<figcaption>((?:Figure|Fig\.?)\s*\d+[.:])/gi,
    "<figcaption><span>$1</span>",
  );
}

// Included files are spliced in verbatim (see below), so any public/ asset
// paths they reference (e.g. figure <img src>) need basePath applied by
// hand too, same as everywhere else raw HTML/JSX bypasses next/link.
function applyBasePathToAssetSrcs(rawHtml: string) {
  return rawHtml.replace(
    /(src|href)="(\/assets\/[^"]*)"/g,
    (_match, attr, path) => `${attr}="${withBasePath(path)}"`,
  );
}

// renderMarkdown() sanitizes raw HTML out of the output by default, which
// would silently drop hand-authored blocks like data tables and figures.
// Splitting on include markers lets those blocks be spliced in verbatim from
// their own file, while the surrounding prose (including fenced code blocks)
// still renders through the normal Markdown pipeline.
export default async function briefMarkdownToHtml(
  markdown: string,
  baseDir: string,
) {
  const segments = markdown.split(INCLUDE_RE);
  const rendered = await Promise.all(
    segments.map((segment, index) => {
      const isIncludeFilename = index % 2 === 1;
      if (isIncludeFilename) {
        const raw = fs.readFileSync(join(baseDir, segment), "utf8");
        return wrapTablesForScrolling(
          labelFigureCaptions(applyBasePathToAssetSrcs(raw)),
        );
      }
      return renderMarkdown(segment);
    }),
  );
  return rendered.join("\n");
}
