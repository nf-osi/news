# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Next.js blog starter template (App Router, TypeScript, Tailwind CSS) as the foundation for this site.
- Category and tag taxonomy: every post has one `category` and zero or more `tags`, each with an auto-generated listing page at `/categories/<slug>` and `/tags/<slug>`.
- WordPress migration script (`scripts/migrate-wordpress.mjs`) that converts a WXR export into `_posts/*.md`, reconstructing paragraph/heading structure, stripping Fusion Builder/Avada shortcodes, and downloading cover images.
- All 33 posts from the original `news.nfdataportal.org` WordPress site, migrated to Markdown.
- Custom NF-OSI author avatar (`public/assets/blog/authors/nf-osi.svg`).
- `README.md` documenting the authoring workflow, current categories/tags, and the WordPress migration.

### Changed

- From the Wordpress export, tags normalized to title case (e.g. `funding` → `Funding`) and tags that only duplicated their post's category (e.g. every `Blog Post`-category post tagged `Blog Post`) were dropped as redundant.

### Fixed

- Researcher Spotlight (and similar Q&A-style) posts rendering as one unbroken paragraph instead of one heading per question — the WordPress export omits the `<p>` tags that WordPress's `wpautop` filter normally adds at render time, so the migration script now reconstructs them.
- Numbered lists in migrated posts restarting/skipping numbers (e.g. "2, 4, 6...") when a list was glued to preceding text with no blank line.
