import { BriefMeta } from "@/app/_components/briefs/brief-meta";
import {
  type BriefAsset,
  type BriefLicense,
} from "@/interfaces/research-brief";

type Props = {
  date: string;
  status?: string;
  version?: string;
  license?: BriefLicense;
  assets?: BriefAsset[];
};

/**
 * The masthead's metadata rail: everything about the brief as an artifact —
 * when it was published, what state it's in, what it's licensed under, and
 * what it points at — kept out of the byline's way. Each group renders only
 * if the brief's frontmatter supplies it.
 */
export function BriefRail({ date, status, version, license, assets }: Props) {
  return (
    <aside className="mt-10 border-t border-card-line pt-8 dark:border-ink-700 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
      <Group>
        <BriefMeta date={date} status={status} version={version} />
      </Group>

      {license && (
        <Group>
          <h2 className="data-label mb-2">License</h2>
          {license.url ? (
            <a
              href={license.url}
              rel="license noopener noreferrer"
              className="font-bold text-brand-600 underline-offset-4 hover:underline dark:text-brand-200"
            >
              {license.name}
            </a>
          ) : (
            <p className="font-bold">{license.name}</p>
          )}
        </Group>
      )}

      {assets && assets.length > 0 && (
        <Group>
          <h2 className="data-label mb-3">Linked assets</h2>
          <ul className="flex flex-col gap-2">
            {assets.map((asset) => (
              <li key={asset.url}>
                <a
                  href={asset.url}
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-2 text-brand-600 underline-offset-4 hover:underline dark:text-brand-200"
                >
                  <AssetIcon type={asset.type} />
                  {asset.name}
                </a>
              </li>
            ))}
          </ul>
        </Group>
      )}
    </aside>
  );
}

/** Rail sections are separated by a hairline, not by spacing alone. */
function Group({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-t border-card-line py-5 first:border-t-0 first:pt-0 last:pb-0 dark:border-ink-700">
      {children}
    </div>
  );
}

const assetPaths: Record<NonNullable<BriefAsset["type"]>, string> = {
  code: "m8 6-6 6 6 6M16 6l6 6-6 6",
  data: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3ZM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
  document:
    "M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7l-4-4Zm0 0v4h4M9 13h6M9 17h6",
  link: "M10 13a4 4 0 0 0 5.7.4l3-3a4 4 0 0 0-5.7-5.7L11.4 6M14 11a4 4 0 0 0-5.7-.4l-3 3a4 4 0 0 0 5.7 5.7L12.6 18",
};

function AssetIcon({ type = "link" }: { type?: BriefAsset["type"] }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="mt-1 shrink-0 opacity-70"
    >
      <path d={assetPaths[type ?? "link"]} />
    </svg>
  );
}
