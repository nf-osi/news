import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllBriefs, getBriefBySlug } from "@/lib/briefs";
import { SITE_NAME } from "@/lib/constants";
import briefMarkdownToHtml from "@/lib/briefMarkdownToHtml";
import { addHeadingIds, extractTableOfContents } from "@/lib/tableOfContents";
import Container from "@/app/_components/container";
import Header from "@/app/_components/header";
import { PostTitle } from "@/app/_components/post-title";
import { PostBody } from "@/app/_components/post-body";
import { BriefMeta } from "@/app/_components/briefs/brief-meta";
import { BriefByline } from "@/app/_components/briefs/brief-byline";
import { BriefTags } from "@/app/_components/briefs/brief-tags";
import { BriefToc } from "@/app/_components/briefs/brief-toc";
import DateFormatter from "@/app/_components/date-formatter";
import researchBriefStyles from "@/app/_components/research-brief-styles.module.css";

export default async function Brief(props: Params) {
  const params = await props.params;
  const brief = getBriefBySlug(params.slug);

  if (!brief) {
    return notFound();
  }

  const rawContent = brief.content || "";
  const tocEntries = extractTableOfContents(rawContent);
  const content = addHeadingIds(
    await briefMarkdownToHtml(rawContent, brief.contentDir || ""),
  );

  return (
    <main>
      <Container>
        <Header />
        <article className="mb-32">
          <PostTitle>{brief.title}</PostTitle>
          <div className="max-w-4xl mx-auto mb-12">
            {brief.tags && brief.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <BriefTags tags={brief.tags} />
              </div>
            )}
            <BriefMeta status={brief.status} version={brief.version} />
            <BriefByline
              authors={brief.authors}
              communityContributors={brief.communityContributors}
            />
            <div className="text-lg">
              <DateFormatter dateString={brief.date} />
            </div>
          </div>
          <div className="max-w-7xl mx-auto grid lg:grid-cols-[220px_1fr] gap-x-24">
            <BriefToc entries={tocEntries} />
            <PostBody content={content} styles={researchBriefStyles} wide />
          </div>
        </article>
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
  const brief = getBriefBySlug(params.slug);

  if (!brief) {
    return notFound();
  }

  return {
    title: `${brief.title} | ${SITE_NAME}`,
  };
}

export async function generateStaticParams() {
  const briefs = getAllBriefs();

  return briefs.map((brief) => ({
    slug: brief.slug,
  }));
}
