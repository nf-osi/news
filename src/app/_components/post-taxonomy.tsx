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
        className="eyebrow hover:underline"
      >
        {category}
      </Link>
      {tags.map((tag) => (
        <Link
          key={tag}
          href={`/tags/${slugify(tag)}`}
          className="tag-chip"
        >
          {tag}
        </Link>
      ))}
    </div>
  );
}
