import { PaginatedContent } from "@/app/_components/paginated-content";

type Props = {
  content: string;
  /** Picks the stylesheet in src/app/prose.css and the column treatment. */
  variant?: "post" | "brief";
};

export function PostBody({ content, variant = "post" }: Props) {
  const isBrief = variant === "brief";
  return (
    // Briefs set their own measure in prose.css so tables and figures can
    // break out past the text; `min-w-0` keeps a wide table from stretching
    // the grid column this sits in.
    <div className={isBrief ? "min-w-0" : "mx-auto max-w-2xl"}>
      <PaginatedContent className={isBrief ? "brief-body" : "article-body"} html={content} />
    </div>
  );
}
