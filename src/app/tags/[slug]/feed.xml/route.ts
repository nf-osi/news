import { NextResponse } from "next/server";
import { getAllTags, getFeedItemsByTag } from "@/lib/api";
import { buildRssFeed } from "@/lib/rss";
import { SITE_NAME } from "@/lib/constants";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return getAllTags().map((tag) => ({ slug: tag.slug }));
}

export async function GET(
  _request: Request,
  props: { params: Promise<{ slug: string }> },
) {
  const { slug } = await props.params;
  const feedItems = getFeedItemsByTag(slug);
  const tag = getAllTags().find((t) => t.slug === slug);

  if (!tag) {
    return new NextResponse("Not found", { status: 404 });
  }

  const xml = buildRssFeed(feedItems, {
    feedPath: `tags/${slug}/feed.xml`,
    title: `${tag.name} | ${SITE_NAME}`,
  });

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
