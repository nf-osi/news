import { Metadata } from "next";
import { notFound } from "next/navigation";
import Container from "@/app/_components/container";
import Header from "@/app/_components/header";
import { MoreStories } from "@/app/_components/more-stories";
import { getAllCategories, getPostsByCategory } from "@/lib/api";
import { SITE_NAME } from "@/lib/constants";

export default async function CategoryPage(props: Params) {
  const params = await props.params;
  const posts = getPostsByCategory(params.slug);

  if (posts.length === 0) {
    return notFound();
  }

  return (
    <main>
      <Container>
        <Header />
        <h1 className="mb-8 text-5xl md:text-7xl font-bold tracking-tighter leading-tight capitalize">
          {posts[0].category}
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
  const posts = getPostsByCategory(params.slug);

  if (posts.length === 0) {
    return notFound();
  }

  return {
    title: `${posts[0].category} | ${SITE_NAME}`,
  };
}

export async function generateStaticParams() {
  const categories = getAllCategories();

  return categories.map((category) => ({
    slug: category.slug,
  }));
}
