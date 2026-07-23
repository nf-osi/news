import Link from "next/link";
import { slugify } from "@/lib/taxonomy";

type Props = {
  tags?: string[];
};

export function BriefTags({ tags = [] }: Props) {
  return (
    <>
      {tags.map((tag) => (
        <Link
          key={tag}
          href={`/tags/${slugify(tag)}`}
          className="text-sm text-accent-7 dark:text-slate-400 bg-accent-1 dark:bg-slate-800 rounded-full px-3 py-1 hover:underline"
        >
          {tag}
        </Link>
      ))}
    </>
  );
}
