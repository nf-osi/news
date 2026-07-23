import { Post } from "@/interfaces/post";
import { FeedItem } from "@/interfaces/feed-item";
import fs from "fs";
import matter from "gray-matter";
import { join } from "path";
import { slugify } from "@/lib/taxonomy";
import { getAllBriefs } from "@/lib/briefs";

const postsDirectory = join(process.cwd(), "_posts");

export function getPostSlugs() {
  return fs.readdirSync(postsDirectory);
}

export function getPostBySlug(slug: string) {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return { ...data, slug: realSlug, content } as Post;
}

export function getAllPosts(): Post[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return posts;
}

export function getAllCategories() {
  const categories = new Map<string, string>();
  for (const post of getAllPosts()) {
    categories.set(slugify(post.category), post.category);
  }
  return Array.from(categories, ([slug, name]) => ({ slug, name }));
}

export function getPostsByCategory(categorySlug: string): Post[] {
  return getAllPosts().filter(
    (post) => slugify(post.category) === categorySlug,
  );
}

export function getAllTags() {
  const tags = new Map<string, string>();
  for (const post of getAllPosts()) {
    for (const tag of post.tags) {
      tags.set(slugify(tag), tag);
    }
  }
  for (const brief of getAllBriefs()) {
    for (const tag of brief.tags || []) {
      tags.set(slugify(tag), tag);
    }
  }
  return Array.from(tags, ([slug, name]) => ({ slug, name }));
}

export function getFeedItemsByTag(tagSlug: string): FeedItem[] {
  const posts: FeedItem[] = getAllPosts()
    .filter((post) => post.tags.some((tag) => slugify(tag) === tagSlug))
    .map((item) => ({ type: "post", item }));
  const briefs: FeedItem[] = getAllBriefs()
    .filter((brief) => (brief.tags || []).some((tag) => slugify(tag) === tagSlug))
    .map((item) => ({ type: "brief", item }));

  return [...posts, ...briefs].sort((a, b) =>
    a.item.date > b.item.date ? -1 : 1,
  );
}
