import Link from "next/link";
import { slugify } from "@/lib/taxonomy";

type Props = {
  category: string;
  tags?: string[];
};

export function PostTaxonomy({ category, tags = [] }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <Link
        href={`/categories/${slugify(category)}`}
        className="text-sm font-bold uppercase tracking-wide text-success hover:underline"
      >
        {category}
      </Link>
      {tags.map((tag) => (
        <Link
          key={tag}
          href={`/tags/${slugify(tag)}`}
          className="text-sm text-accent-7 dark:text-slate-400 bg-accent-1 dark:bg-slate-800 rounded-full px-3 py-1 hover:underline"
        >
          {tag}
        </Link>
      ))}
    </div>
  );
}
