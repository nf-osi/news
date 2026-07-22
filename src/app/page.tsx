import Container from "@/app/_components/container";
import { HeroPost } from "@/app/_components/hero-post";
import { HeroBrief } from "@/app/_components/briefs/hero-brief";
import { Intro } from "@/app/_components/intro";
import { MoreItems } from "@/app/_components/more-items";
import { getAllFeedItems } from "@/lib/feed";

export default function Index() {
  const feedItems = getAllFeedItems();

  const heroItem = feedItems[0];
  const moreItems = feedItems.slice(1);

  return (
    <main>
      <Container>
        <Intro />
        {heroItem.type === "post" ? (
          <HeroPost
            title={heroItem.item.title}
            coverImage={heroItem.item.coverImage}
            date={heroItem.item.date}
            authors={heroItem.item.authors}
            slug={heroItem.item.slug}
            excerpt={heroItem.item.excerpt}
            category={heroItem.item.category}
            tags={heroItem.item.tags}
          />
        ) : (
          <HeroBrief
            title={heroItem.item.title}
            date={heroItem.item.date}
            excerpt={heroItem.item.excerpt}
            authors={heroItem.item.authors}
            slug={heroItem.item.slug}
          />
        )}
        {moreItems.length > 0 && <MoreItems items={moreItems} />}
      </Container>
    </main>
  );
}
