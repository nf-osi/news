import Authors from "@/app/_components/authors";
import CoverImage from "@/app/_components/cover-image";
import { type Author } from "@/interfaces/author";
import Link from "next/link";
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

export function HeroPost({
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
    <section>
      <div className="mb-8 md:mb-16">
        <CoverImage title={title} src={coverImage} href={`/posts/${slug}`} />
      </div>
      <div className="md:grid md:grid-cols-2 md:gap-x-16 lg:gap-x-8 mb-20 md:mb-28">
        <div>
          <PostTaxonomy category={category} tags={tags} />
          <h3 className="mb-4 text-4xl lg:text-5xl leading-tight">
            <Link href={`/posts/${slug}`} className="hover:underline">
              {title}
            </Link>
          </h3>
          <div className="mb-4 md:mb-0 text-lg">
            <DateFormatter dateString={date} />
          </div>
        </div>
        <div>
          <p className="text-lg leading-relaxed mb-4">{excerpt}</p>
          <Authors authors={authors} />
        </div>
      </div>
    </section>
  );
}
