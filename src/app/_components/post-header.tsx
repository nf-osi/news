import Authors from "./authors";
import CoverImage from "./cover-image";
import DateFormatter from "./date-formatter";
import { PostTitle } from "@/app/_components/post-title";
import { PostTaxonomy } from "@/app/_components/post-taxonomy";
import { type Author } from "@/interfaces/author";

type Props = {
  title: string;
  coverImage: string;
  date: string;
  authors: Author[];
  category: string;
  tags: string[];
};

export function PostHeader({
  title,
  coverImage,
  date,
  authors,
  category,
  tags,
}: Props) {
  return (
    <>
      <div className="mx-auto max-w-2xl">
        <PostTaxonomy category={category} tags={tags} />
        <PostTitle>{title}</PostTitle>
        <div className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-lg text-ink-300 dark:text-slate-400">
          <Authors authors={authors} />
          <DateFormatter dateString={date} />
        </div>
      </div>
      <div className="mb-10 md:mb-16">
        <CoverImage title={title} src={coverImage} />
      </div>
    </>
  );
}
