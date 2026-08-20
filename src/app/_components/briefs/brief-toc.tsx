"use client";

import Link from "next/link";
import cn from "classnames";
import { useEffect, useState } from "react";
import { type TocEntry } from "@/lib/tableOfContents";

type Props = {
  entries: TocEntry[];
};

// Distance below the sticky site header at which a heading counts as "current".
const ACTIVE_OFFSET = 140;

export function BriefToc({ entries }: Props) {
  const activeId = useActiveHeading(entries);

  if (entries.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Table of contents"
      className="sticky top-24 hidden max-h-[calc(100vh-8rem)] self-start overflow-y-auto pb-8 text-base lg:block"
    >
      <h2 className="data-label mb-4">Contents</h2>
      <ul className="border-l border-card-line dark:border-ink-700">
        {entries.map((entry) => {
          const isActive = entry.id === activeId;
          return (
            <li key={entry.id}>
              <Link
                href={`#${entry.id}`}
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  "-ml-px block border-l py-1.5 leading-snug transition-colors",
                  entry.depth === 3 ? "pl-8 text-sm" : "pl-4",
                  isActive
                    ? "border-brand-500 font-bold text-brand-600 dark:border-brand-200 dark:text-brand-200"
                    : "border-transparent text-ink-300 hover:border-brand-200 hover:text-brand-600 dark:text-slate-400 dark:hover:text-white",
                )}
              >
                {entry.text}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** The last heading scrolled past, so the rail tracks the reader's position. */
function useActiveHeading(entries: TocEntry[]) {
  const [activeId, setActiveId] = useState<string>();

  useEffect(() => {
    if (entries.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      let current: string | undefined;
      for (const entry of entries) {
        const heading = document.getElementById(entry.id);
        if (heading && heading.getBoundingClientRect().top <= ACTIVE_OFFSET) {
          current = entry.id;
        }
      }
      // Before the first heading scrolls past, highlight it rather than nothing.
      setActiveId(current ?? entries[0].id);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [entries]);

  return activeId;
}
