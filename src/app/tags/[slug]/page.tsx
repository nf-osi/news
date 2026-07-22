import { Metadata } from "next";
import { notFound } from "next/navigation";
import Container from "@/app/_components/container";
import Header from "@/app/_components/header";
import { MoreStories } from "@/app/_components/more-stories";
import { getAllTags, getPostsByTag } from "@/lib/api";
import { SITE_NAME } from "@/lib/constants";
import { slugify } from "@/lib/taxonomy";

export default async function TagPage(props: Params) {
  const params = await props.params;
  const posts = getPostsByTag(params.slug);

  if (posts.length === 0) {
    return notFound();
  }

  const tagName = posts[0].tags.find((tag) => slugify(tag) === params.slug)!;

  return (
    <main>
      <Container>
        <Header />
        <h1 className="mb-8 text-5xl md:text-7xl font-bold tracking-tighter leading-tight capitalize">
          {tagName}
        </h1>
        <MoreStories posts={posts} />
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
  const posts = getPostsByTag(params.slug);

  if (posts.length === 0) {
    return notFound();
  }

  const tagName = posts[0].tags.find((tag) => slugify(tag) === params.slug)!;

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
