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

export function HeroBrief({
  title,
  date,
  excerpt,
  authors,
  tags,
  slug,
}: Props) {
  return (
    <section>
      <div className="mb-8 md:mb-16">
        <CoverImage
          title={title}
          src="/assets/briefs/cover.svg"
          href={`/briefs/${slug}`}
        />
      </div>
      <div className="md:grid md:grid-cols-2 md:gap-x-16 lg:gap-x-8 mb-20 md:mb-28">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm font-bold uppercase tracking-wide text-success inline-block">
              Research Brief
            </span>
            <BriefTags tags={tags} />
          </div>
          <h3 className="mb-4 text-4xl lg:text-5xl leading-tight">
            <Link href={`/briefs/${slug}`} className="hover:underline">
              {title}
            </Link>
          </h3>
          <div className="mb-4 md:mb-0 text-lg">
            <DateFormatter dateString={date} />
          </div>
        </div>
        <div>
          {excerpt && <p className="text-lg leading-relaxed mb-4">{excerpt}</p>}
          <Authors
            authors={authors.map((author) => ({
              name: author.name,
              picture: "/assets/blog/authors/nf-osi.svg",
            }))}
          />
        </div>
      </div>
    </section>
  );
}
