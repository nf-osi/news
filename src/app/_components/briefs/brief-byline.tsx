import { type BriefAuthor } from "@/interfaces/research-brief";
import { withBasePath } from "@/lib/base-path";

type Props = {
  authors: BriefAuthor[];
  communityContributors?: string[];
};

export function BriefByline({ authors, communityContributors }: Props) {
  return (
    <div className="text-lg mb-6">
      <h2 className="text-sm font-bold uppercase tracking-wide text-accent-7 dark:text-slate-400 mb-2">
        Authors
      </h2>
      <ul className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
        {authors.map((author) => (
          <li key={author.name} className="flex items-center gap-1.5">
            {author.url ? (
              <a href={author.url} className="font-bold hover:underline">
                {author.name}
              </a>
            ) : (
              <span className="font-bold">{author.name}</span>
            )}
            {author.affiliation && (
              <>
                {" ("}
                {author.affiliationUrl ? (
                  <a href={author.affiliationUrl} className="hover:underline">
                    {author.affiliation}
                  </a>
                ) : (
                  author.affiliation
                )}
                {")"}
              </>
            )}
            {author.orcid && (
              <a
                href={`https://orcid.org/${author.orcid}`}
                className="inline-flex items-center"
                aria-label={`${author.name} on ORCID`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={withBasePath("/assets/briefs/orcid-icon.png")}
                  alt="ORCID ID"
                  width={16}
                  height={16}
                />
              </a>
            )}
          </li>
        ))}
      </ul>
      {communityContributors && communityContributors.length > 0 && (
        <>
          <h2 className="text-sm font-bold uppercase tracking-wide text-accent-7 dark:text-slate-400 mb-2">
            Community Contributors
          </h2>
          <p>{communityContributors.join(", ")}</p>
        </>
      )}
    </div>
  );
}
