import Container from "@/app/_components/container";
import { PostPreview } from "@/app/_components/post-preview";
import { HeroBrief } from "@/app/_components/briefs/hero-brief";
import { Intro } from "@/app/_components/intro";
import { MoreItems } from "@/app/_components/more-items";
import { getAllPosts } from "@/lib/api";
import { getAllBriefs } from "@/lib/briefs";
import { getAllFeedItems } from "@/lib/feed";

export default function Index() {
  // The featured row pairs the newest post with the newest brief, rather than
  // whichever of the two happens to be more recent — briefs are published
  // rarely enough that they would otherwise never surface here.
  const [latestPost] = getAllPosts();
  const [latestBrief] = getAllBriefs();

  const moreItems = getAllFeedItems().filter(
    (feedItem) =>
      !(feedItem.type === "post" && feedItem.item.slug === latestPost?.slug) &&
      !(feedItem.type === "brief" && feedItem.item.slug === latestBrief?.slug),
  );

  return (
    <main>
      <Intro />
      <Container>
        <section
          aria-label="Featured"
          className="grid grid-cols-1 items-start gap-10 pb-16 pt-12 md:pb-20 lg:grid-cols-[3fr_2fr] lg:gap-12"
        >
          {latestPost && (
            <PostPreview
              featured
              title={latestPost.title}
              coverImage={latestPost.coverImage}
              date={latestPost.date}
              authors={latestPost.authors}
              slug={latestPost.slug}
              excerpt={latestPost.excerpt}
              category={latestPost.category}
              tags={latestPost.tags}
            />
          )}
          {latestBrief && (
            <HeroBrief
              title={latestBrief.title}
              date={latestBrief.date}
              status={latestBrief.status}
              version={latestBrief.version}
              excerpt={latestBrief.excerpt}
              authors={latestBrief.authors}
              tags={latestBrief.tags}
              slug={latestBrief.slug}
            />
          )}
        </section>
        {moreItems.length > 0 && <MoreItems items={moreItems} />}
      </Container>
    </main>
  );
}
