export type BriefAuthor = {
  name: string;
  url?: string;
  affiliation?: string;
  affiliationUrl?: string;
  orcid?: string;
};

export type ResearchBrief = {
  slug: string;
  title: string;
  status: string;
  version: string;
  date: string;
  authors: BriefAuthor[];
  communityContributors?: string[];
  excerpt?: string;
  content: string;
  contentDir?: string;
};
