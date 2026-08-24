import renderMarkdown from "@/lib/renderMarkdown";

export default async function markdownToHtml(markdown: string) {
  return renderMarkdown(markdown);
}
