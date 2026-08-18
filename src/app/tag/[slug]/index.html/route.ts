import { NextResponse } from "next/server";
import { getAllTags } from "@/lib/api";
import { buildTagRssFeed } from "@/lib/rss";

// Matches RssFeedCards' WordPress-style feed request: `/tag/<slug>/?feed=rss2`.
// Static hosting ignores the query string, so this is served for that URL as
// well as a plain visit to `/tag/<slug>/` — see issue #19.
export const dynamic = "force-static";

export async function generateStaticParams() {
  return getAllTags().map((tag) => ({ slug: tag.slug }));
}

export async function GET(
  _request: Request,
  props: { params: Promise<{ slug: string }> },
) {
  const { slug } = await props.params;
  const xml = buildTagRssFeed(slug, `tag/${slug}/`);

  if (xml === null) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
