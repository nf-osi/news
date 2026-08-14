// next/image and raw <img>/<link> tags don't auto-prepend `basePath` to
// public/ asset paths (unlike next/link, which does) — apply it by hand at
// the leaf components/metadata that render a public/ path coming from
// frontmatter or a literal string. Also imported by next.config.ts, so this
// is the single source of truth for the value.
//
// Empty since the site moved to its own domain (news.nf.synapse.org) and is
// served from the root — `withBasePath` is a no-op, kept so a future move back
// under a path prefix is a one-line change here.
export const basePath = "";

export function withBasePath(path: string) {
  return `${basePath}${path}`;
}
