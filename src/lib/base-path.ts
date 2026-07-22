// next/image and raw <img>/<link> tags don't auto-prepend `basePath` to
// public/ asset paths (unlike next/link, which does) — apply it by hand at
// the leaf components/metadata that render a public/ path coming from
// frontmatter or a literal string. Also imported by next.config.ts, so this
// is the single source of truth for the value.
export const basePath = "/news";

export function withBasePath(path: string) {
  return `${basePath}${path}`;
}
