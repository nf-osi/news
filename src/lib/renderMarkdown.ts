import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";

// Shiki themes for the two color schemes this site supports (`darkMode:
// "class"` in tailwind.config.ts, toggled by theme-switcher.tsx). With a
// {light, dark} theme pair, rehype-pretty-code writes both colors onto every
// token as `--shiki-light`/`--shiki-dark` custom properties instead of
// picking one — prose.css reads whichever one applies based on the `.dark`
// class on <html>, so the same build output serves both themes.
const codeThemes = { light: "github-light", dark: "github-dark" };

// A unified processor is meant to be reused across `.process()` calls, and
// rehype-pretty-code caches its Shiki highlighter instance on first use — one
// processor for the whole build means that highlighter loads once instead of
// once per post/brief.
//
// rehypeSanitize runs *before* rehypePrettyCode with the default (GitHub)
// schema, matching remark-html's old default of stripping raw HTML out of
// hand-written Markdown; a fenced code block still comes through fine since
// the default schema already keeps `<code class="language-*">`. Running
// sanitize first also means it never sees (and can't strip) the `style`/
// `data-*` attributes rehype-pretty-code adds afterward for highlighting.
const processor = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeSanitize)
  // rehype-pretty-code's published types describe a plain function rather
  // than unified's `Plugin` shape, which trips up `.use()`'s overload
  // resolution — the options object below is correct at runtime.
  // @ts-expect-error -- see above
  .use(rehypePrettyCode, { theme: codeThemes, keepBackground: false })
  .use(rehypeStringify);

export default async function renderMarkdown(markdown: string) {
  const file = await processor.process(markdown);
  return String(file);
}
