# NF Data Portal News

A statically generated blog for the [NF Open Science Initiative](https://nf.synapse.org/), built with Next.js (App Router), TypeScript, and Tailwind CSS. Posts are Markdown files with front matter — there is no CMS or database.

## Adding a new post

1. Create a new Markdown file in [`_posts/`](./_posts), named after the post's slug (e.g. `_posts/my-new-post.md`). The filename becomes the URL: `/posts/my-new-post`.
2. Add front matter and content:

   ```md
   ---
   title: "Your Post Title"
   excerpt: "A short summary shown on the homepage and in link previews."
   coverImage: "/assets/blog/my-new-post/cover.png"
   date: "2026-07-21T00:00:00.000Z"
   author:
     name: Your Name
     picture: "/assets/blog/authors/nf-osi.png"
   category: "Blog Post"
   tags:
     - "Featured"
   ogImage:
     url: "/assets/blog/my-new-post/cover.png"
   ---

   Post content goes here, in Markdown.
   ```

3. Put the cover image at `public/assets/blog/my-new-post/cover.png` (create the directory). Reuse `/assets/blog/authors/nf-osi.png` for the author picture unless the author has their own.
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
- Don't add a tag that just repeats the category — pick the category instead.
- Reuse an existing category/tag if one already fits; only introduce a new one if the post genuinely doesn't fit the current set.

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build, prerenders every post/category/tag page
npm run start    # serve the production build
```

## Project structure

- `_posts/` — one Markdown file per post, with YAML front matter.
- `src/app/` — Next.js App Router pages (`/`, `/posts/[slug]`, `/categories/[slug]`, `/tags/[slug]`).
- `src/app/_components/` — page components (post previews, headers, taxonomy pills, etc).
- `src/lib/api.ts` — reads `_posts/`, exposes `getAllPosts`, `getPostsByCategory`, `getPostsByTag`, etc.
- `src/lib/markdownToHtml.ts` — converts a post's Markdown body to HTML via `remark`.
- `src/interfaces/` — `Post` and `Author` types.
- `public/assets/blog/` — cover images (one subdirectory per post slug) and author pictures.

## WordPress migration

This blog replaced a WordPress site (`news.nfdataportal.org`). The original content was exported as WXR (`export.xml`, gitignored — ask a maintainer if you need the source file) and converted with [`scripts/migrate-wordpress.mjs`](./scripts/migrate-wordpress.mjs), which:

- strips Fusion Builder/Avada shortcodes (buttons, image frames, sliders, titles) down to plain HTML,
- reconstructs paragraph and heading breaks the way WordPress's `wpautop` would have rendered them (the raw export doesn't contain literal `<p>` tags),
- promotes bold+italic "fake subheading" paragraphs (WordPress's manual way of faking a heading) to real `<h3>` elements, pulling out any inline headshot image so it isn't lost,
- converts the result to Markdown with [`turndown`](https://github.com/mixmark-io/turndown),
- downloads each post's featured image into `public/assets/blog/<slug>/`,
- writes one `_posts/<slug>.md` file per post, with `category`/`tags` normalized as described above.

The script is idempotent and rewrites `_posts/` from scratch — re-run it with `node scripts/migrate-wordpress.mjs` if `export.xml` changes. It's a one-off tool kept for reference; it is **not** part of the normal authoring workflow (see "Adding a new post" above).
