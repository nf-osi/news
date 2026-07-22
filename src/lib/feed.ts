import { FeedItem } from "@/interfaces/feed-item";
import { getAllPosts } from "@/lib/api";
import { getAllBriefs } from "@/lib/briefs";

export function getAllFeedItems(): FeedItem[] {
  const posts: FeedItem[] = getAllPosts().map((item) => ({
    type: "post",
    item,
  }));
  const briefs: FeedItem[] = getAllBriefs().map((item) => ({
    type: "brief",
    item,
  }));

  return [...posts, ...briefs].sort((a, b) =>
    a.item.date > b.item.date ? -1 : 1,
  );
}
