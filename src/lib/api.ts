import { Post } from "@/interfaces/post";
import fs from "fs";
import matter from "gray-matter";
import { join } from "path";
import { slugify } from "@/lib/taxonomy";

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
  return Array.from(tags, ([slug, name]) => ({ slug, name }));
}

export function getPostsByTag(tagSlug: string): Post[] {
  return getAllPosts().filter((post) =>
    post.tags.some((tag) => slugify(tag) === tagSlug),
  );
}
