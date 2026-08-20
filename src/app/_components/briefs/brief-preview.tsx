import Link from "next/link";
import { type BriefAuthor } from "@/interfaces/research-brief";
import Authors from "@/app/_components/authors";
import { BriefTags } from "@/app/_components/briefs/brief-tags";
import CoverImage from "@/app/_components/cover-image";
import DateFormatter from "@/app/_components/date-formatter";

type Props = {
  title: string;
  date: string;
  excerpt?: string;
  authors: BriefAuthor[];
  tags?: string[];
  slug: string;
};

export function BriefPreview({
  title,
  date,
  excerpt,
  authors,
  tags,
  slug,
}: Props) {
  return (
    <div>
      <div className="mb-5">
        <CoverImage
          title={title}
          src="/assets/briefs/cover.svg"
          href={`/briefs/${slug}`}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="eyebrow">Research Brief</span>
        <BriefTags tags={tags} />
      </div>
      <h3 className="mb-3 text-2xl font-bold leading-snug tracking-tight">
        <Link
          href={`/briefs/${slug}`}
          className="hover:text-brand-600 hover:underline dark:hover:text-brand-200"
        >
          {title}
        </Link>
      </h3>
      <div className="mb-4 text-lg text-ink-300 dark:text-slate-400">
        <DateFormatter dateString={date} />
      </div>
      {excerpt && <p className="text-lg leading-relaxed mb-4">{excerpt}</p>}
      <Authors
        authors={authors.map((author) => ({
          name: author.name,
          picture: "/assets/blog/authors/nf-osi.svg",
        }))}
      />
    </div>
  );
}
