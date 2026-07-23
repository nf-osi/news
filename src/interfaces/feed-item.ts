import { Post } from "./post";
import { ResearchBrief } from "./research-brief";

export type FeedItem =
  | { type: "post"; item: Post }
  | { type: "brief"; item: ResearchBrief };
