# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Next.js blog starter template (App Router, TypeScript, Tailwind CSS) as the foundation for this site.
- Category and tag taxonomy: every post has one `category` and zero or more `tags`, each with an auto-generated listing page at `/categories/<slug>` and `/tags/<slug>`.
- WordPress migration script (`scripts/migrate-wordpress.mjs`) that converts a WXR export into `_posts/*.md`, reconstructing paragraph/heading structure, stripping Fusion Builder/Avada shortcodes, and downloading cover images.
- All 33 posts from the original `news.nfdataportal.org` WordPress site, migrated to Markdown.
- Custom NF-OSI author avatar (`public/assets/blog/authors/nf-osi.png`) replacing the default Next.js placeholder.
- `README.md` documenting the authoring workflow, current categories/tags, and the WordPress migration.

### Changed

- Site title and tagline updated from the generic template copy to "NF Data Portal News".
- Footer updated to link to the NF Data Portal and NF-OSI contact email instead of the template's Next.js links.
- Tags normalized to title case (e.g. `funding` → `Funding`) and tags that only duplicated their post's category (e.g. every `Blog Post`-category post tagged `Blog Post`) were dropped as redundant.

### Fixed

- Researcher Spotlight (and similar Q&A-style) posts rendering as one unbroken paragraph instead of one heading per question — the WordPress export omits the `<p>` tags that WordPress's `wpautop` filter normally adds at render time, so the migration script now reconstructs them.
- Numbered lists in migrated posts restarting/skipping numbers (e.g. "2, 4, 6...") when a list was glued to preceding text with no blank line.
- Inline headshot images on Researcher Spotlight posts being dropped when promoting their surrounding paragraph to a heading; they're now preserved above the heading, sized as a small headshot instead of full width.
