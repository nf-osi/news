import { FeedItem } from "@/interfaces/feed-item";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/constants";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Fallback for the rare item with no excerpt (e.g. research briefs, where
// it's optional) — strips the most common Markdown syntax so readers aren't
// shown raw `#`/`[]()`/`**` in their preview text.
function stripMarkdown(markdown: string) {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#*_`>~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getFeedItemDescription(feedItem: FeedItem): string {
  if (feedItem.item.excerpt) return feedItem.item.excerpt;
  const text = stripMarkdown(feedItem.item.content);
  return text.length > 300 ? `${text.slice(0, 300).trim()}…` : text;
}

function getFeedItemPath(feedItem: FeedItem): string {
  return feedItem.type === "post"
    ? `posts/${feedItem.item.slug}`
    : `briefs/${feedItem.item.slug}`;
}

function getFeedItemCategories(feedItem: FeedItem): string[] {
  const categories = new Set<string>();
  if (feedItem.type === "post") {
    categories.add(feedItem.item.category);
  }
  for (const tag of feedItem.item.tags || []) {
    categories.add(tag);
  }
  return Array.from(categories);
}

type RssFeedOptions = {
  // Path (relative to SITE_URL) the feed itself is served from, e.g.
  // "feed.xml" or "tags/featured/feed.xml" — used for the self-referencing
  // atom:link.
  feedPath: string;
  title?: string;
};

export function buildRssFeed(
  feedItems: FeedItem[],
  { feedPath, title }: RssFeedOptions,
): string {
  const feedUrl = new URL(feedPath, SITE_URL).toString();

  const items = feedItems
    .map((feedItem) => {
      const link = new URL(getFeedItemPath(feedItem), SITE_URL).toString();
      const pubDate = new Date(feedItem.item.date).toUTCString();
      const categories = getFeedItemCategories(feedItem)
        .map((category) => `<category>${escapeXml(category)}</category>`)
        .join("");

      return `
    <item>
      <title>${escapeXml(feedItem.item.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(getFeedItemDescription(feedItem))}</description>${categories}
    </item>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title ?? SITE_NAME)}</title>
    <link>${escapeXml(SITE_URL)}</link>
    <description>${escapeXml(SITE_TAGLINE)}</description>
    <language>en-us</language>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>
`;
}
