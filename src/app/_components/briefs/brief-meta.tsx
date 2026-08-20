import DateFormatter from "@/app/_components/date-formatter";

type Props = {
  date: string;
  /** Optional frontmatter — a brief may carry neither. */
  status?: string;
  version?: string;
  className?: string;
};

/**
 * A brief's document metadata as label/value rows, in the same idiom the
 * portal's study cards use for theirs. Shared by the brief masthead and the
 * homepage's featured brief card.
 */
export function BriefMeta({ date, status, version, className }: Props) {
  return (
    <dl className={className}>
      <Field label="Published">
        <DateFormatter dateString={date} />
      </Field>
      {status && <Field label="Status">{status}</Field>}
      {version && <Field label="Version">{version}</Field>}
    </dl>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 py-1">
      <dt className="data-label w-28 shrink-0 pt-0.5">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
