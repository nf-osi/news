import { ResearchBrief } from "@/interfaces/research-brief";
import fs from "fs";
import matter from "gray-matter";
import { join } from "path";

export const briefsDirectory = join(process.cwd(), "_briefs");

export function getBriefSlugs() {
  if (!fs.existsSync(briefsDirectory)) {
    return [];
  }
  return fs
    .readdirSync(briefsDirectory)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

export function getBriefBySlug(slug: string) {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(briefsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return { ...data, slug: realSlug, content } as ResearchBrief;
}

export function getAllBriefs(): ResearchBrief[] {
  const slugs = getBriefSlugs();
  const briefs = slugs
    .map((slug) => getBriefBySlug(slug))
    // sort briefs by date in descending order
    .sort((brief1, brief2) => (brief1.date > brief2.date ? -1 : 1));
  return briefs;
}
