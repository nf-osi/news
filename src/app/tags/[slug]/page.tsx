import { Metadata } from "next";
import { notFound } from "next/navigation";
import Container from "@/app/_components/container";
import Header from "@/app/_components/header";
import { MoreItems } from "@/app/_components/more-items";
import { getAllTags, getFeedItemsByTag } from "@/lib/api";
import { SITE_NAME } from "@/lib/constants";
import { slugify } from "@/lib/taxonomy";

function findTagName(feedItems: ReturnType<typeof getFeedItemsByTag>, tagSlug: string) {
  for (const feedItem of feedItems) {
    const tags = feedItem.item.tags || [];
    const match = tags.find((tag) => slugify(tag) === tagSlug);
    if (match) return match;
  }
  return undefined;
}

export default async function TagPage(props: Params) {
  const params = await props.params;
  const feedItems = getFeedItemsByTag(params.slug);

  if (feedItems.length === 0) {
    return notFound();
  }

  const tagName = findTagName(feedItems, params.slug)!;

  return (
    <main>
      <Container>
        <Header />
        <h1 className="mb-8 text-5xl md:text-7xl font-bold tracking-tighter leading-tight capitalize">
          {tagName}
        </h1>
        <MoreItems items={feedItems} />
      </Container>
    </main>
  );
}

type Params = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata(props: Params): Promise<Metadata> {
  const params = await props.params;
  const feedItems = getFeedItemsByTag(params.slug);

  if (feedItems.length === 0) {
    return notFound();
  }

  const tagName = findTagName(feedItems, params.slug)!;

  return {
    title: `${tagName} | ${SITE_NAME}`,
  };
}

export async function generateStaticParams() {
  const tags = getAllTags();

  return tags.map((tag) => ({
    slug: tag.slug,
  }));
}
