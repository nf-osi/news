import { NextResponse } from "next/server";
import { getAllFeedItems } from "@/lib/feed";
import { buildRssFeed } from "@/lib/rss";

export const dynamic = "force-static";

export function GET() {
  const xml = buildRssFeed(getAllFeedItems(), { feedPath: "feed.xml" });

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
