import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllBriefs, getBriefBySlug } from "@/lib/briefs";
import { SITE_NAME } from "@/lib/constants";
import briefMarkdownToHtml from "@/lib/briefMarkdownToHtml";
import { addHeadingIds, extractTableOfContents } from "@/lib/tableOfContents";
import Container from "@/app/_components/container";
import { PostTitle } from "@/app/_components/post-title";
import { PostBody } from "@/app/_components/post-body";
import { BriefRail } from "@/app/_components/briefs/brief-rail";
import { BriefByline } from "@/app/_components/briefs/brief-byline";
import { BriefTags } from "@/app/_components/briefs/brief-tags";
import { BriefToc } from "@/app/_components/briefs/brief-toc";

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
        <article className="mx-auto max-w-7xl pb-32 pt-12 md:pt-16">
          <header className="mb-12 border-b border-card-line pb-10 dark:border-ink-700">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="eyebrow">Research Brief</span>
              <BriefTags tags={brief.tags} />
            </div>
            <PostTitle>{brief.title}</PostTitle>
            <div className="grid grid-cols-[minmax(0,1fr)] gap-x-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
              <BriefByline
                authors={brief.authors}
                communityContributors={brief.communityContributors}
              />
              <BriefRail
                date={brief.date}
                status={brief.status}
                version={brief.version}
                license={brief.license}
                assets={brief.assets}
              />
            </div>
          </header>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-x-16 lg:grid-cols-[15rem_minmax(0,1fr)]">
            <BriefToc entries={tocEntries} />
            <PostBody content={content} variant="brief" />
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
