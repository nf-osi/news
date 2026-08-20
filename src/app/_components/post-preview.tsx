import cn from "classnames";
import { type Author } from "@/interfaces/author";
import Link from "next/link";
import Authors from "./authors";
import CoverImage from "./cover-image";
import DateFormatter from "./date-formatter";
import { PostTaxonomy } from "./post-taxonomy";

type Props = {
  title: string;
  coverImage: string;
  date: string;
  excerpt: string;
  authors: Author[];
  slug: string;
  category: string;
  tags: string[];
  /** Larger type for the homepage's featured slot. */
  featured?: boolean;
};

export function PostPreview({
  title,
  coverImage,
  date,
  excerpt,
  authors,
  slug,
  category,
  tags,
  featured = false,
}: Props) {
  return (
    <article>
      <div className="mb-5">
        <CoverImage href={`/posts/${slug}`} title={title} src={coverImage} />
      </div>
      <PostTaxonomy category={category} tags={tags} />
      <h3
        className={cn(
          "mb-3 font-bold leading-snug tracking-tight",
          featured ? "text-3xl" : "text-2xl",
        )}
      >
        <Link
          href={`/posts/${slug}`}
          className="hover:text-brand-600 hover:underline dark:hover:text-brand-200"
        >
          {title}
        </Link>
      </h3>
      <div className="mb-4 text-lg text-ink-300 dark:text-slate-400">
        <DateFormatter dateString={date} />
      </div>
      <p className="text-lg leading-relaxed mb-4">{excerpt}</p>
      <Authors authors={authors} />
    </article>
  );
}
