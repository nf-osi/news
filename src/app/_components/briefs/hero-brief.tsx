import Link from "next/link";
import { type BriefAuthor } from "@/interfaces/research-brief";
import Avatar from "@/app/_components/avatar";
import DateFormatter from "@/app/_components/date-formatter";

type Props = {
  title: string;
  date: string;
  excerpt?: string;
  authors: BriefAuthor[];
  slug: string;
};

export function HeroBrief({ title, date, excerpt, authors, slug }: Props) {
  return (
    <section>
      <div className="md:grid md:grid-cols-2 md:gap-x-16 lg:gap-x-8 mb-20 md:mb-28">
        <div>
          <span className="text-sm font-bold uppercase tracking-wide text-success mb-4 inline-block">
            Research Brief
          </span>
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
          <Avatar
            name={authors.map((author) => author.name).join(", ")}
            picture="/assets/blog/authors/nf-osi.svg"
          />
        </div>
      </div>
    </section>
  );
}
