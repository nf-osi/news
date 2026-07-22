type Props = {
  status: string;
  version: string;
};

export function BriefMeta({ status, version }: Props) {
  return (
    <p className="text-lg text-accent-7 dark:text-slate-400">
      Status: <strong>{status}</strong>
      <br />
      Version: <strong>{version}</strong>
    </p>
  );
}
