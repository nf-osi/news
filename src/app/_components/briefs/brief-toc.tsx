import Link from "next/link";
import { type TocEntry } from "@/lib/tableOfContents";

type Props = {
  entries: TocEntry[];
};

export function BriefToc({ entries }: Props) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Table of contents"
      className="hidden lg:block sticky top-8 self-start text-base"
    >
      <h2 className="font-bold uppercase tracking-wide text-sm mb-3 text-accent-7 dark:text-slate-400">
        Contents
      </h2>
      <ul>
        {entries.map((entry) => (
          <li
            key={entry.id}
            className={entry.depth === 3 ? "pl-4" : undefined}
          >
            <Link
              href={`#${entry.id}`}
              className="block py-1 text-accent-7 dark:text-slate-400 hover:text-black dark:hover:text-white hover:underline"
            >
              {entry.text}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
