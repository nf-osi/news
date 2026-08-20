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
          className="tag-chip"
        >
          {tag}
        </Link>
      ))}
    </>
  );
}
