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
}: Props) {
  return (
    <div>
      <div className="mb-5">
        <CoverImage href={`/posts/${slug}`} title={title} src={coverImage} />
      </div>
      <PostTaxonomy category={category} tags={tags} />
      <h3 className="text-3xl mb-3 leading-snug">
        <Link href={`/posts/${slug}`} className="hover:underline">
          {title}
        </Link>
      </h3>
      <div className="text-lg mb-4">
        <DateFormatter dateString={date} />
      </div>
      <p className="text-lg leading-relaxed mb-4">{excerpt}</p>
      <Authors authors={authors} />
    </div>
  );
}
