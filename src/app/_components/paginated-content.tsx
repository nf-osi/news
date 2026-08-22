"use client";

import { useEffect, useRef } from "react";

const DEFAULT_PAGE_SIZE = 10;

// Opt a hand-authored table into client-side pagination by giving it
// `data-paginate="<rows per page>"` (see e.g. _briefs/*/table.html). The
// table itself is static HTML spliced in by markdownToHtml/
// briefMarkdownToHtml — see README's "Raw HTML" section — so this hydrates
// it after mount rather than teaching the Markdown pipeline about paging.
function paginateTables(root: HTMLElement) {
  const tables = root.querySelectorAll<HTMLTableElement>("table[data-paginate]");
  const cleanups: Array<() => void> = [];

  tables.forEach((table) => {
    const tbody = table.tBodies[0];
    if (!tbody) return;

    const rows = Array.from(tbody.rows);
    const pageSize = Number(table.dataset.paginate) || DEFAULT_PAGE_SIZE;
    const pageCount = Math.ceil(rows.length / pageSize);
    if (pageCount <= 1) return;

    let page = 0;

    const nav = document.createElement("div");
    nav.className = "table-pagination";

    const prev = document.createElement("button");
    prev.type = "button";
    prev.textContent = "Previous";

    const status = document.createElement("span");
    status.setAttribute("aria-live", "polite");

    const next = document.createElement("button");
    next.type = "button";
    next.textContent = "Next";

    nav.append(prev, status, next);
    // A [data-table-scroll] wrapper (see briefMarkdownToHtml.ts) owns the
    // table's horizontal scrolling; anchor the controls to that when present
    // so they sit directly under the table rather than under its scroll box.
    (table.closest<HTMLElement>("[data-table-scroll]") ?? table).after(nav);

    function render() {
      rows.forEach((row, i) => {
        row.hidden = i < page * pageSize || i >= (page + 1) * pageSize;
      });
      status.textContent = `Page ${page + 1} of ${pageCount}`;
      prev.disabled = page === 0;
      next.disabled = page === pageCount - 1;
    }

    const goPrev = () => {
      page = Math.max(0, page - 1);
      render();
    };
    const goNext = () => {
      page = Math.min(pageCount - 1, page + 1);
      render();
    };

    prev.addEventListener("click", goPrev);
    next.addEventListener("click", goNext);
    render();

    cleanups.push(() => {
      prev.removeEventListener("click", goPrev);
      next.removeEventListener("click", goNext);
      nav.remove();
    });
  });

  return () => cleanups.forEach((cleanup) => cleanup());
}

type Props = {
  className: string;
  html: string;
};

/** A dangerouslySetInnerHTML div that also wires up any `data-paginate` tables inside. */
export function PaginatedContent({ className, html }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    return paginateTables(ref.current);
  }, [html]);

  return (
    <div ref={ref} className={className} dangerouslySetInnerHTML={{ __html: html }} />
  );
}
