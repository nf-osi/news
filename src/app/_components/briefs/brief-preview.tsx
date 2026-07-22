import Link from "next/link";
import { type BriefAuthor } from "@/interfaces/research-brief";
import Authors from "@/app/_components/authors";
import DateFormatter from "@/app/_components/date-formatter";

type Props = {
  title: string;
  date: string;
  excerpt?: string;
  authors: BriefAuthor[];
  slug: string;
};

export function BriefPreview({ title, date, excerpt, authors, slug }: Props) {
  return (
    <div>
      <span className="text-sm font-bold uppercase tracking-wide text-success mb-4 inline-block">
        Research Brief
      </span>
      <h3 className="text-3xl mb-3 leading-snug">
        <Link href={`/briefs/${slug}`} className="hover:underline">
          {title}
        </Link>
      </h3>
      <div className="text-lg mb-4">
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
