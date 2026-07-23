// One-off migration: converts export.xml (WordPress WXR) into _posts/*.md
// Run with: node scripts/migrate-wordpress.mjs
import fs from "fs";
import path from "path";
import { XMLParser } from "fast-xml-parser";
import TurndownService from "turndown";

const ROOT = path.resolve(import.meta.dirname, "..");
const XML_PATH = path.join(ROOT, "export.xml");
const POSTS_DIR = path.join(ROOT, "_posts");
const COVERS_DIR = path.join(ROOT, "public", "assets", "blog");

const AUTHOR_DISPLAY_NAMES = {
  ambernelson: "Amber Nelson",
  admin: "NF-OSI",
};

const turndown = new TurndownService({
  headingStyle: "atx",
  bulletListMarker: "-",
});

// Turndown's default image rule drops all attributes but src/alt, which
// would lose the "headshot" marker class added below — keep this one as
// raw HTML so the smaller headshot styling survives into the .md file.
turndown.addRule("headshotImage", {
  filter: (node) =>
    node.nodeName === "IMG" && node.getAttribute("class") === "headshot",
  replacement: (_content, node) => {
    const src = node.getAttribute("src");
    const alt = node.getAttribute("alt") || "";
    return `<img class="headshot" src="${src}" alt="${alt}" />\n\n`;
  },
});

function stripFusionShortcodes(html) {
  let text = html;

  // fusion_button wraps its label text and carries the URL in `link` -> <a>
  text = text.replace(
    /\[fusion_button link="([^"]*)"[^\]]*\]([^[]*)\[\/fusion_button\]/g,
    (_m, href, label) => `<a href="${href}">${label.trim()}</a>`,
  );

  // fusion_countdown carries its copy in heading/subheading/link_url attrs -> preserve as text
  text = text.replace(
    /\[fusion_countdown[^\]]*heading_text="([^"]*)"[^\]]*subheading_text="([^"]*)"[^\]]*link_url="([^"]*)"[^\]]*\/?\]/g,
    (_m, heading, subheading, href) =>
      `<h3>${heading}</h3><p>${subheading} <a href="${href}">${href}</a></p>`,
  );

  // Self-closing separators carry no content -> drop entirely
  text = text.replace(/\[fusion_separator[^\]]*\/?\]/g, "");

  // fusion_image (self-closing, image attr holds URL) -> <img>
  text = text.replace(
    /\[fusion_image image="([^"]*)"[^\]]*\/?\]/g,
    (_m, src) => `<img src="${src}" alt="" />`,
  );

  // fusion_imageframe / fusion_slide wrap a bare URL as their content -> <img>
  text = text.replace(
    /\[fusion_imageframe[^\]]*alt="([^"]*)"[^\]]*\]([^[]*)\[\/fusion_imageframe\]/g,
    (_m, alt, src) => `<img src="${src.trim()}" alt="${alt}" />`,
  );
  text = text.replace(
    /\[fusion_slide[^\]]*\]([^[]*)\[\/fusion_slide\]/g,
    (_m, src) => `<img src="${src.trim()}" alt="" />`,
  );

  // fusion_title wraps a text/HTML heading
  text = text.replace(
    /\[fusion_title[^\]]*\]([\s\S]*?)\[\/fusion_title\]/g,
    (_m, inner) => `<h2>${inner.trim()}</h2>`,
  );

  // Remaining container/text/wrapper shortcodes -> unwrap, keep inner content
  text = text.replace(/\[\/?fusion_[a-z_]+[^\]]*\]/g, "");

  // WordPress [caption]...<img>...[/caption] -> keep the inner img/caption text
  text = text.replace(
    /\[caption[^\]]*\]([\s\S]*?)\[\/caption\]/g,
    (_m, inner) => inner,
  );

  return text.trim();
}

const BLOCK_TAG_RE =
  /^<(h[1-6]|div|ul|ol|li|blockquote|pre|table|p|figure|hr)[\s>]/i;

// WordPress renders raw post bodies through `wpautop`, which turns
// blank-line-separated text into <p> blocks at display time. The exported
// XML keeps the raw pre-wpautop text, so we have to redo that conversion
// ourselves or every post collapses into a single paragraph.
const BLOCK_TAG_NAMES =
  "h[1-6]|div|ul|ol|blockquote|pre|table|p|figure|hr";

function wpautop(html) {
  // Force block-level tags onto their own blank-line-delimited chunk even
  // when they're glued to inline text on the same line (e.g. "Captions:\n<ol>"),
  // otherwise the whole thing gets treated as one plain-text block below.
  let normalized = html
    .replace(new RegExp(`\\s*(<(?:${BLOCK_TAG_NAMES})[^>]*>)`, "gi"), "\n\n$1")
    .replace(new RegExp(`(</(?:${BLOCK_TAG_NAMES})>)\\s*`, "gi"), "$1\n\n");

  const blocks = normalized.split(/\n\s*\n/);
  return blocks
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (BLOCK_TAG_RE.test(trimmed)) return trimmed;
      return `<p>${trimmed.replace(/\n/g, "<br />\n")}</p>`;
    })
    .filter(Boolean)
    .join("\n\n");
}

// A paragraph that is ENTIRELY a bold+italic run (WordPress's usual way of
// faking a subheading) reads better as a real heading once autop wraps it.
// The first one often carries the post's own headshot floated inline via
// align="right" — pull it out in front of the heading rather than dropping
// it, since it's a real photo (distinct from the post's generic cover image).
function promoteEmphasisOnlyParagraphsToHeadings(html) {
  return html.replace(
    /<p>\s*<(em|strong|b|i)>(?:<span[^>]*>)?<(em|strong|b|i)>([\s\S]*?)<\/(em|strong|b|i)>\s*(?:<\/span>)?<\/(em|strong|b|i)>\s*<\/p>/g,
    (_m, _t1, _t2, inner) => {
      const leadingImageMatch = inner.match(/^\s*<img([^>]*)>\s*/);
      const leadingImage = leadingImageMatch
        ? `<img class="headshot"${leadingImageMatch[1]}>`
        : "";
      const withoutLeadingImage = inner.replace(/^\s*<img[^>]*>\s*/, "");
      return `${leadingImage}<h3>${withoutLeadingImage.trim()}</h3>`;
    },
  );
}

function htmlToMarkdown(html) {
  const stripped = stripFusionShortcodes(html);
  const withParagraphs = wpautop(stripped);
  const withHeadings = promoteEmphasisOnlyParagraphsToHeadings(withParagraphs);
  return turndown.turndown(withHeadings).trim();
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function yamlEscape(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

const TITLE_CASE_MINOR_WORDS = new Set([
  "a",
  "an",
  "and",
  "as",
  "at",
  "but",
  "by",
  "for",
  "in",
  "nor",
  "of",
  "on",
  "or",
  "the",
  "to",
]);

// WordPress tags are user-entered and inconsistently cased ("funding",
// "hackathon" vs "Newsletter", "NF1") — normalize to title case, but leave
// words that are already all-caps (acronyms like NF1, NF News) untouched.
function titleCase(value) {
  return value
    .split(" ")
    .map((word, index) => {
      if (word === word.toUpperCase()) return word;
      if (index > 0 && TITLE_CASE_MINOR_WORDS.has(word.toLowerCase())) {
        return word.toLowerCase();
      }
      return word[0].toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

function urlExtension(url) {
  const clean = url.split("?")[0];
  const ext = path.extname(clean);
  return ext || ".jpg";
}

async function downloadFile(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destPath, buffer);
}

async function main() {
  const xml = fs.readFileSync(XML_PATH, "utf8");
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    isArray: (name) => ["item", "category", "postmeta"].includes(name),
  });
  const doc = parser.parse(xml);
  const items = doc.rss.channel.item;

  const posts = items.filter((item) => item["wp:post_type"] === "post");
  const attachmentsById = new Map(
    items
      .filter((item) => item["wp:post_type"] === "attachment")
      .map((item) => [String(item["wp:post_id"]), item]),
  );

  fs.rmSync(POSTS_DIR, { recursive: true, force: true });
  fs.mkdirSync(POSTS_DIR, { recursive: true });

  let migrated = 0;

  for (const post of posts) {
    const slug = post["wp:post_name"];
    const title = post.title;
    const dateGmt = post["wp:post_date_gmt"];
    const isoDate = `${dateGmt.replace(" ", "T")}.000Z`;
    const authorLogin = post["dc:creator"];
    const authorName = AUTHOR_DISPLAY_NAMES[authorLogin] || authorLogin;

    const categories = Array.isArray(post.category) ? post.category : [];
    const category = categories.find((c) => c.domain === "category");
    const categoryName = titleCase(category ? category["#text"] : "Blog Post");
    // Drop tags that just repeat the category (e.g. every "Blog Post"
    // category post was also tagged "Blog Post") — redundant with category.
    const tags = categories
      .filter((c) => c.domain === "post_tag")
      .map((c) => titleCase(c["#text"]))
      .filter((name) => name !== categoryName);

    const meta = post["wp:postmeta"] || [];
    const thumbMeta = meta.find((m) => m["wp:meta_key"] === "_thumbnail_id");
    const thumbId = thumbMeta ? String(thumbMeta["wp:meta_value"]) : null;
    const attachment = thumbId ? attachmentsById.get(thumbId) : null;
    const coverImageUrl = attachment ? attachment["wp:attachment_url"] : null;

    const postDir = path.join(COVERS_DIR, slug);
    fs.mkdirSync(postDir, { recursive: true });

    let coverImagePath = null;
    if (coverImageUrl) {
      const ext = urlExtension(coverImageUrl);
      const destFile = `cover${ext}`;
      const destPath = path.join(postDir, destFile);
      try {
        await downloadFile(coverImageUrl, destPath);
        coverImagePath = `/assets/blog/${slug}/${destFile}`;
      } catch (err) {
        console.warn(`  cover image failed for ${slug}: ${err.message}`);
        coverImagePath = null;
      }
    }

    const contentHtml = post["content:encoded"] || "";
    const contentMarkdown = htmlToMarkdown(contentHtml);

    const excerptSource = contentMarkdown
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // drop markdown images entirely
      .replace(/<img\b[^>]*>/gi, "") // drop raw HTML images (e.g. headshots)
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // keep link text, drop the URL
      .replace(/[#*_>`]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    const excerpt =
      excerptSource.length > 220
        ? `${excerptSource.slice(0, 220).trim()}...`
        : excerptSource;

    const frontmatterLines = [
      "---",
      `title: "${yamlEscape(title)}"`,
      `excerpt: "${yamlEscape(excerpt)}"`,
      coverImagePath ? `coverImage: "${coverImagePath}"` : null,
      `date: "${isoDate}"`,
      "authors:",
      `  - name: ${authorName}`,
      `    picture: "/assets/blog/authors/nf-osi.svg"`,
      `category: "${yamlEscape(categoryName)}"`,
      tags.length > 0 ? "tags:" : "tags: []",
      ...tags.map((tag) => `  - "${yamlEscape(tag)}"`),
      "ogImage:",
      coverImagePath ? `  url: "${coverImagePath}"` : null,
      "---",
      "",
    ].filter((line) => line !== null);

    const fileContents = `${frontmatterLines.join("\n")}\n${contentMarkdown}\n`;
    fs.writeFileSync(path.join(POSTS_DIR, `${slug}.md`), fileContents, "utf8");
    migrated++;
    console.log(`migrated: ${slug}`);
  }

  console.log(`\nDone. Migrated ${migrated}/${posts.length} posts.`);
}

main();
