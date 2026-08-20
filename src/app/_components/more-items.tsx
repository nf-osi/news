import { FeedItem } from "@/interfaces/feed-item";
import { PostPreview } from "./post-preview";
import { BriefPreview } from "./briefs/brief-preview";

type Props = {
  items: FeedItem[];
  /** Section heading above the grid; pass null on pages that already have an
   *  <h1> describing the list (tag and category archives). */
  title?: string | null;
};

export function MoreItems({ items, title = "More Stories" }: Props) {
  return (
    <section>
      {title && (
        <h2 className="mb-10 border-t border-brand-50 pt-10 text-3xl font-bold leading-tight tracking-tight dark:border-ink-700 md:text-4xl">
          {title}
        </h2>
      )}
      <div className="mb-32 grid grid-cols-1 gap-y-16 md:grid-cols-2 md:gap-x-12 md:gap-y-20">
        {items.map((feedItem) =>
          feedItem.type === "post" ? (
            <PostPreview
              key={feedItem.item.slug}
              title={feedItem.item.title}
              coverImage={feedItem.item.coverImage}
              date={feedItem.item.date}
              authors={feedItem.item.authors}
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
              tags={feedItem.item.tags}
              slug={feedItem.item.slug}
            />
          ),
        )}
      </div>
    </section>
  );
}
