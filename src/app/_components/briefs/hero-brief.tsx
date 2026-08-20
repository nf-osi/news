import Link from "next/link";
import { type BriefAuthor } from "@/interfaces/research-brief";
import { BriefMeta } from "@/app/_components/briefs/brief-meta";
import { BriefTags } from "@/app/_components/briefs/brief-tags";

type Props = {
  title: string;
  date: string;
  status?: string;
  version?: string;
  excerpt?: string;
  authors: BriefAuthor[];
  tags?: string[];
  slug: string;
};

// The homepage's featured brief, built like a study card on nf.synapse.org
// (`.SRC-portalCard`): square 1px neutral border, no shadow, an underlined
// blue title over an italic byline, then label/value document metadata.
//
// Deliberately unlike the post beside it — no cover image, since briefs share
// one generic placeholder — and it carries the document metadata a brief has
// and a post doesn't.
export function HeroBrief({
  title,
  date,
  status,
  version,
  excerpt,
  authors,
  tags,
  slug,
}: Props) {
  return (
    <article className="border border-card-line p-6 dark:border-ink-700 md:p-8">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="eyebrow">Research Brief</span>
        <BriefTags tags={tags} />
      </div>
      <h3 className="mb-2 text-2xl font-bold leading-snug tracking-tight">
        <Link
          href={`/briefs/${slug}`}
          className="text-brand-600 underline underline-offset-4 hover:text-brand-400 dark:text-brand-200 dark:hover:text-brand-100"
        >
          {title}
        </Link>
      </h3>
      <p className="mb-4 italic text-ink-300 dark:text-slate-400">
        {authors.map((author) => author.name).join(", ")}
      </p>
      {excerpt && <p className="text-lg leading-relaxed">{excerpt}</p>}
      <BriefMeta date={date} status={status} version={version} className="mt-6" />
      <Link
        href={`/briefs/${slug}`}
        className="mt-6 inline-block font-bold text-brand-600 underline-offset-4 hover:underline dark:text-brand-200"
      >
        Read the brief →
      </Link>
    </article>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 py-1">
      <dt className="data-label w-28 shrink-0 pt-0.5">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
