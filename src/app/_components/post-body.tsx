import markdownStyles from "./markdown-styles.module.css";

type Props = {
  content: string;
  styles?: Record<string, string>;
  wide?: boolean;
};

export function PostBody({ content, styles = markdownStyles, wide }: Props) {
  return (
    <div className={wide ? "max-w-4xl mx-auto" : "max-w-2xl mx-auto"}>
      <div
        className={styles["markdown"]}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
