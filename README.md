# NF Data Portal News

A statically generated site for the [NF Open Science Initiative](https://nf.synapse.org/), built with Next.js (App Router), TypeScript, and Tailwind CSS. All content is Markdown files with front matter. There are two independent content types:

- **Blog posts** (`_posts/`, routes under `/posts`, `/categories`, `/tags`) — news, announcements, researcher spotlights.
- **Research briefs** (`_briefs/`, routes under `/briefs`) — multi-author scientific documents like specs and RFC summaries, with their own metadata shape (status/version, author affiliations/ORCID, community contributors).

See "Adding a new post" and "Adding a new research brief" below for each.

## Adding a new post

1. Create a new Markdown file in [`_posts/`](./_posts), named after the post's slug (e.g. `_posts/my-new-post.md`). The filename becomes the URL: `/posts/my-new-post`.
2. Add front matter and content:

   ```md
   ---
   title: "Your Post Title"
   excerpt: "A short summary shown on the homepage and in link previews."
   coverImage: "/assets/blog/my-new-post/cover.png"
   date: "2026-07-21T00:00:00.000Z"
   authors:
     - name: Your Name
       picture: "/assets/blog/authors/nf-osi.svg"
   category: "Blog Post"
   tags:
     - "Featured"
   ogImage:
     url: "/assets/blog/my-new-post/cover.png"
   ---

   Post content goes here, in Markdown.
   ```

   `authors` is a list — add another entry for a co-authored post.

3. Put the cover image at `public/assets/blog/my-new-post/cover.png` (create the directory). Reuse `/assets/blog/authors/nf-osi.svg` for the author picture unless the author has their own.
4. Run `npm run dev` and check `http://localhost:3000` before committing.

Posts are sorted by `date` descending; the most recent post becomes the homepage hero.

### Categories and tags

Every post has exactly one `category` and zero or more `tags`. Categories and tags each get an auto-generated listing page at `/categories/<slug>` and `/tags/<slug>` (see `src/lib/api.ts`).

Current categories:

- `Blog Post`
- `Newsletter`
- `Press Release`

Current tags:

- `Data Analysis`
- `Data Sharing`
- `Featured`
- `Francis S Collins Scholars`
- `Funding`
- `Hackathon`
- `Hack for NF 2020`
- `NF1`
- `NF News`
- `Open Access`
- `Opportunity`
- `Postdoc`
- `Publication`
- `Release`
- `Researcher Spotlight`

Conventions:

- Tags are title case (`Funding`, not `funding`), except acronyms (`NF1`, `NF News`).
- Reuse an existing category/tag if one already fits; introduce a new one if the post genuinely doesn't fit the current set.

## Adding a new research brief

Research briefs are a separate content type from blog posts — multi-author scientific documents (specs, RFC summaries, etc.) with their own metadata shape: `status`/`version`, an array of authors with affiliation/ORCID links, and an optional plain-name "Community Contributors" list. They live at `/briefs` and `/briefs/<slug>`, completely independent of the blog pipeline (`_posts/`, `Post`, categories/tags).

1. Create `_briefs/<slug>.md` with front matter:

   ```md
   ---
   title: "Your Brief Title"
   status: "Draft"
   version: "1.0.0"
   date: "2026-07-21T00:00:00.000Z"
   authors:
     - name: Author Name
       url: "https://github.com/username"
       affiliation: Sage Bionetworks
       affiliationUrl: "https://sagebionetworks.org/"
       orcid: "0000-0000-0000-0000"
   communityContributors:
     - Contributor Name
   excerpt: "A short summary for the /briefs index."
   ---

   Body content goes here, in Markdown.
   ```

   `url`, `affiliation`, `affiliationUrl`, `orcid`, and `communityContributors` are all optional.

2. **Raw HTML (tables, figures)**: `remark-html`'s default sanitizer silently strips raw HTML blocks from Markdown. Put raw HTML in its own file next to the `.md` (e.g. `_briefs/<slug>.table.html`, `_briefs/<slug>.fig1.html`) and reference it from the Markdown body with an include marker on its own line:

   ```md
   <!-- include: your-slug.table.html -->
   ```

   `src/lib/briefMarkdownToHtml.ts` splices the referenced file's contents in verbatim at that exact spot — the surrounding prose still renders through the normal Markdown pipeline, but the included file is never sanitized. Figure images referenced from an include file go in `public/assets/briefs/<slug>/`.

3. Run `npm run dev` and check `http://localhost:3000/briefs/<slug>` before committing.

Briefs are sorted by `date` descending on the `/briefs` index. See `_briefs/rfc-brief.md` (with `rfc-brief.table.html` and `rfc-brief.fig1.html`–`fig4.html`) for a full worked example, migrated from [nf-osi.github.io/research/rfc-brief.html](https://nf-osi.github.io/research/rfc-brief.html).

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build, prerenders every post/category/tag page
npm run start    # serve the production build
```

## Project structure

- `_posts/` — one Markdown file per blog post, with YAML front matter.
- `_briefs/` — one Markdown file per research brief, plus sibling `.html` files for raw table/figure includes (see "Adding a new research brief").
- `src/app/` — Next.js App Router pages: `/`, `/posts/[slug]`, `/categories/[slug]`, `/tags/[slug]` (blog), and `/briefs`, `/briefs/[slug]` (research briefs).
- `src/app/_components/` — page components (post previews, headers, taxonomy pills, etc); brief-specific components live in `src/app/_components/briefs/`.
- `src/lib/api.ts` — reads `_posts/`, exposes `getAllPosts`, `getPostsByCategory`, `getPostsByTag`, etc.
- `src/lib/briefs.ts` — reads `_briefs/`, exposes `getAllBriefs`, `getBriefBySlug`.
- `src/lib/markdownToHtml.ts` — converts a blog post's Markdown body to HTML via `remark`.
- `src/lib/briefMarkdownToHtml.ts` — same, but also splices in raw HTML from `<!-- include: ... -->` file references.
- `src/interfaces/` — `Post`/`Author` (blog) and `ResearchBrief`/`BriefAuthor` (briefs) types.
- `public/assets/blog/` — cover images (one subdirectory per post slug) and author pictures.
- `public/assets/briefs/` — figure/image assets for research briefs, one subdirectory per brief slug.

## WordPress migration

This blog replaced a WordPress site (`news.nfdataportal.org`). The original content was exported as WXR (`export.xml`, gitignored — ask a maintainer if you need the source file) and converted with [`scripts/migrate-wordpress.mjs`](./scripts/migrate-wordpress.mjs), which:

- strips Fusion Builder/Avada shortcodes (buttons, image frames, sliders, titles) down to plain HTML,
- reconstructs paragraph and heading breaks the way WordPress's `wpautop` would have rendered them (the raw export doesn't contain literal `<p>` tags),
- promotes bold+italic "fake subheading" paragraphs (WordPress's manual way of faking a heading) to real `<h3>` elements, pulling out any inline headshot image so it isn't lost,
- converts the result to Markdown with [`turndown`](https://github.com/mixmark-io/turndown),
- downloads each post's featured image into `public/assets/blog/<slug>/`,
- writes one `_posts/<slug>.md` file per post, with `category`/`tags` normalized as described above.

The script is idempotent and rewrites `_posts/` from scratch — re-run it with `node scripts/migrate-wordpress.mjs` if `export.xml` changes. It's a one-off tool kept for reference; it is **not** part of the normal authoring workflow (see "Adding a new post" above).
