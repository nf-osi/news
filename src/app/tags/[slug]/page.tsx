import { Metadata } from "next";
import { notFound } from "next/navigation";
import Container from "@/app/_components/container";
import { PageHeading } from "@/app/_components/page-heading";
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
        <PageHeading eyebrow="Tag">
          <span className="capitalize">{tagName}</span>
        </PageHeading>
        <MoreItems items={feedItems} title={null} />
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
