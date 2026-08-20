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
      <div
        className={isBrief ? "brief-body" : "article-body"}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
