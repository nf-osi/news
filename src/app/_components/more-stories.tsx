import { Post } from "@/interfaces/post";
import { PostPreview } from "./post-preview";

type Props = {
  posts: Post[];
  /** Section heading above the grid; pass null on pages that already have an
   *  <h1> describing the list (tag and category archives). */
  title?: string | null;
};

export function MoreStories({ posts, title = "More Stories" }: Props) {
  return (
    <section>
      {title && (
        <h2 className="mb-10 border-t border-brand-50 pt-10 text-3xl font-bold leading-tight tracking-tight dark:border-ink-700 md:text-4xl">
          {title}
        </h2>
      )}
      <div className="mb-32 grid grid-cols-1 gap-y-16 md:grid-cols-2 md:gap-x-12 md:gap-y-20">
        {posts.map((post) => (
          <PostPreview
            key={post.slug}
            title={post.title}
            coverImage={post.coverImage}
            date={post.date}
            authors={post.authors}
            slug={post.slug}
            excerpt={post.excerpt}
            category={post.category}
            tags={post.tags}
          />
        ))}
      </div>
    </section>
  );
}
