export type BriefAuthor = {
  name: string;
  url?: string;
  affiliation?: string;
  affiliationUrl?: string;
  orcid?: string;
};

/** A licence the brief is released under, e.g. CC BY 4.0. */
export type BriefLicense = {
  name: string;
  url?: string;
};

/** Something the brief points at: a Synapse project, a repo, a protocol. */
export type BriefAsset = {
  name: string;
  url: string;
  /** Picks the icon shown beside the link; falls back to a generic link. */
  type?: "code" | "data" | "document" | "link";
};

export type ResearchBrief = {
  slug: string;
  title: string;
  status?: string;
  version?: string;
  date: string;
  authors: BriefAuthor[];
  communityContributors?: string[];
  excerpt?: string;
  tags?: string[];
  license?: BriefLicense;
  assets?: BriefAsset[];
  content: string;
  contentDir?: string;
};
