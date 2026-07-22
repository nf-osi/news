import { FeedItem } from "@/interfaces/feed-item";
import { PostPreview } from "./post-preview";
import { BriefPreview } from "./briefs/brief-preview";

type Props = {
  items: FeedItem[];
};

export function MoreItems({ items }: Props) {
  return (
    <section>
      <h2 className="mb-8 text-5xl md:text-7xl font-bold tracking-tighter leading-tight">
        More Stories
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-16 lg:gap-x-32 gap-y-20 md:gap-y-32 mb-32">
        {items.map((feedItem) =>
          feedItem.type === "post" ? (
            <PostPreview
              key={feedItem.item.slug}
              title={feedItem.item.title}
              coverImage={feedItem.item.coverImage}
              date={feedItem.item.date}
              author={feedItem.item.author}
              slug={feedItem.item.slug}
              excerpt={feedItem.item.excerpt}
              category={feedItem.item.category}
              tags={feedItem.item.tags}
            />
          ) : (
            <BriefPreview
              key={feedItem.item.slug}
              title={feedItem.item.title}
              date={feedItem.item.date}
              excerpt={feedItem.item.excerpt}
              authors={feedItem.item.authors}
              slug={feedItem.item.slug}
            />
          ),
        )}
      </div>
    </section>
  );
}
