# NF Data Portal News

A statically generated site for the [NF Open Science Initiative](https://nf.synapse.org/), built with Next.js (App Router), TypeScript, and Tailwind CSS. All content is Markdown files with front matter. There are two independent content types:

- **Blog posts** (`_posts/`, routes under `/posts`, `/categories`, `/tags`) — news, announcements, researcher spotlights.
- **Research briefs** (`_briefs/`, routes under `/briefs`) — multi-author documents like specs and reports that contain can table and figures, with their own metadata shape (status/version, author affiliations/ORCID, community contributors).

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

Current tags (shared with research briefs — see below):

- `Data Analysis`
- `Data Sharing`
- `Data Standards`
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

> [!IMPORTANT]
> `Featured` is an important tag that drives the "featured" RSS feed at `/tags/featured/feed.xml`; the [NF Data Portal](https://nf.synapse.org/) homepage pulls from directly to show its news cards. Whatever is tagged `Featured` here is what visitors see there, so keep it current; add the tag to new posts worth surfacing and remove it from old ones.

## RSS feeds

- `/feed.xml` — every post and research brief, newest first.
- `/tags/<slug>/feed.xml` — same, filtered to one tag (e.g. `/tags/featured/feed.xml`).

Both are generated at build time by `src/lib/rss.ts` from `getAllFeedItems()`/`getFeedItemsByTag()`.

## Adding a new research brief

Briefs are a separate content type from blog posts — multi-author scientific documents (specs, reports, etc.) with their own metadata shape: `status`/`version`, an array of authors with affiliation/ORCID links, and an optional plain-name "Community Contributors" list. They live at `/briefs` and `/briefs/<slug>`, independent of the blog pipeline (`_posts/`, `Post`, categories) except for `tags`, which are shared with blog posts through the same `/tags/<slug>` pages.

1. Create `_briefs/<slug>/brief.md` with front matter:

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
   tags:
     - "Data Standards"
   license:
     name: "CC BY 4.0"
     url: "https://creativecommons.org/licenses/by/4.0/"
   assets:
     - name: "Survey responses"
       url: "https://www.synapse.org/#!Synapse:syn00000000"
       type: data
     - name: "Analysis code"
       url: "https://github.com/nf-osi/example"
       type: code
   ---

   Body content goes here, in Markdown.
   ```

   Only `title` and `date` are required. `status`, `version`, `license`, and `assets` fill the metadata rail beside the byline; `url`, `affiliation`, `affiliationUrl`, and `orcid` refine an author; `communityContributors`, `excerpt`, and `tags` are optional too. `tags` uses the same tag list as blog posts (see "Categories and tags" above).

   Each asset takes an optional `type` — `data`, `code`, `document`, or `link` (the default) — which picks its icon. Every rail field renders only when the brief supplies it, so omitting a key leaves no empty row or heading behind.

2. **Raw HTML (tables, figures)**: `remark-html`'s default sanitizer silently strips raw HTML blocks from Markdown. Put raw HTML in its own file next to `brief.md` (e.g. `_briefs/<slug>/table.html`, `_briefs/<slug>/fig1.html`) and reference it from the Markdown body with an include marker on its own line:

   ```md
   <!-- include: table.html -->
   ```

   `src/lib/briefMarkdownToHtml.ts` splices the referenced file's contents in verbatim at that exact spot — the surrounding prose still renders through the normal Markdown pipeline, but the included file is never sanitized. Figure images referenced from an include file go in `public/assets/briefs/<slug>/`.

3. Run `npm run dev` and check `http://localhost:3000/briefs/<slug>` before committing.

Briefs are sorted by `date` descending on the `/briefs` index. See `_briefs/standards-rfc-2022/brief.md` (with `table.html` and `fig1.html`–`fig4.html`) for a full worked example, migrated from [nf-osi.github.io/research/rfc-brief.html](https://nf-osi.github.io/research/rfc-brief.html).

## Design system

The site borrows the NF Data Portal's design system for branding alignment. The source of truth is [`Sage-Bionetworks/synapse-web-monorepo`](https://github.com/Sage-Bionetworks/synapse-web-monorepo):

| | Portal source | Here |
| --- | --- | --- |
| Colors | `nfPortalPalette` in `packages/synapse-react-client/src/theme/palette/Palettes.ts` — primary `#125e81`, secondary `#404b63` | `src/lib/brand.ts`, exposed to Tailwind as the `brand` / `ink` scales |
| Type | `defaultFontFamily` (DM Sans) in `packages/synapse-react-client/src/theme/typography/Typography.ts` | `next/font/google` in `src/app/layout.tsx`, wired to Tailwind's `font-sans` |
| Header / footer | `apps/synapse-portal-framework/src/components/{navbar/Navbar,Footer}.tsx` + `apps/portals/nf/src/config/` | `src/app/_components/{header,footer}.tsx` |
| Logo, hero artwork | `apps/portals/nf/public/logo.svg`, `apps/portals/nf/src/config/style/{nfLogoWhite,molecule-back}.svg` | `public/brand/` |

When adding UI, reach for the `brand`/`ink` scales and the `.eyebrow` / `.nav-link` / `.tag-chip` component classes in `src/app/globals.css` before introducing a new color or one-off style. If design changes upstream, update `src/lib/brand.ts` and the copies in `public/brand/`.

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build, prerenders every post/category/tag page
npm run start    # serve the production build
```

## Project structure

- `_posts/` — one Markdown file per blog post, with YAML front matter.
- `_briefs/` — one folder per research brief; each folder contains `brief.md` plus any sibling `.html` include files (see "Adding a new research brief").
- `src/app/` — Next.js App Router pages: `/`, `/posts/[slug]`, `/categories/[slug]`, `/tags/[slug]` (blog), `/briefs`, `/briefs/[slug]` (research briefs), and `/feed.xml`, `/tags/[slug]/feed.xml` (RSS, see "RSS feeds" above).
- `src/app/_components/` — page components (post previews, headers, taxonomy pills, etc); brief-specific components live in `src/app/_components/briefs/`.
- `src/lib/api.ts` — reads `_posts/`, exposes `getAllPosts`, `getPostsByCategory`, `getPostsByTag`, etc.
- `src/lib/briefs.ts` — reads `_briefs/`, exposes `getAllBriefs`, `getBriefBySlug`.
- `src/lib/markdownToHtml.ts` — converts a blog post's Markdown body to HTML via `remark`.
- `src/lib/briefMarkdownToHtml.ts` — same, but also splices in raw HTML from `<!-- include: ... -->` file references.
- `src/lib/rss.ts` — builds the RSS 2.0 XML served by `/feed.xml` and `/tags/[slug]/feed.xml`.
- `src/interfaces/` — `Post`/`Author` (blog) and `ResearchBrief`/`BriefAuthor` (briefs) types.
- `src/lib/brand.ts` — the color scales, shared by `tailwind.config.ts` and by code that needs a raw hex (see "Design system" above).
- `public/assets/blog/` — cover images (one subdirectory per post slug) and author pictures.
- `public/assets/briefs/` — figure/image assets for research briefs, one subdirectory per brief slug.
- `public/brand/` — the NF wordmark (light and dark) and the hero molecule artwork, copied from the portal.

## WordPress migration

This blog replaced a WordPress site (`news.nfdataportal.org`). The original content was exported as WXR (`export.xml`, gitignored — ask a maintainer if you need the source file) and converted with [`scripts/migrate-wordpress.mjs`](./scripts/migrate-wordpress.mjs), which:

- strips Fusion Builder/Avada shortcodes (buttons, image frames, sliders, titles) down to plain HTML,
- reconstructs paragraph and heading breaks the way WordPress's `wpautop` would have rendered them (the raw export doesn't contain literal `<p>` tags),
- promotes bold+italic "fake subheading" paragraphs (WordPress's manual way of faking a heading) to real `<h3>` elements, pulling out any inline headshot image so it isn't lost,
- converts the result to Markdown with [`turndown`](https://github.com/mixmark-io/turndown),
- downloads each post's featured image into `public/assets/blog/<slug>/`,
- writes one `_posts/<slug>.md` file per post, with `category`/`tags` normalized as described above.

The script is idempotent and rewrites `_posts/` from scratch — re-run it with `node scripts/migrate-wordpress.mjs` if `export.xml` changes. It's a one-off tool kept for reference; it is **not** part of the normal authoring workflow (see "Adding a new post" above).
