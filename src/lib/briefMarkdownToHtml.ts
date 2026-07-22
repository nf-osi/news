import fs from "fs";
import { join } from "path";
import { remark } from "remark";
import html from "remark-html";

// Matches a standalone "<!-- include: filename.html -->" line.
const INCLUDE_RE = /^<!--\s*include:\s*(\S+)\s*-->$/m;

// remark-html sanitizes raw HTML out of the output by default, which would
// silently drop hand-authored blocks like data tables and figures. Splitting
// on include markers lets those blocks be spliced in verbatim from their own
// file, while the surrounding prose still renders through the normal
// Markdown pipeline.
export default async function briefMarkdownToHtml(
  markdown: string,
  baseDir: string,
) {
  const segments = markdown.split(INCLUDE_RE);
  const rendered = await Promise.all(
    segments.map((segment, index) => {
      const isIncludeFilename = index % 2 === 1;
      if (isIncludeFilename) {
        return fs.readFileSync(join(baseDir, segment), "utf8");
      }
      return remark()
        .use(html)
        .process(segment)
        .then((result) => result.toString());
    }),
  );
  return rendered.join("\n");
}
