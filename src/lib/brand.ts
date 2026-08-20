// Single source of truth for the site's colors, mirroring the NF Data Portal's
// design system in Sage-Bionetworks/synapse-web-monorepo so this site reads as
// part of nf.synapse.org rather than a generic blog.
//
// `brand` and `ink` are `nfPortalPalette`'s primary (#125e81) and secondary
// (#404b63), expanded with the same ramp `generatePalette()` applies in
// packages/synapse-react-client/src/theme/palette/Palettes.ts. The 50 stops are
// additions — that ramp starts at a fairly dark 100 and we need lighter
// surfaces for chips, table headers, and hover states.
//
// Imported by tailwind.config.ts (as Tailwind color scales) and by code that
// needs a raw string instead of a class, e.g. `theme-color`.

export const brand = {
  50: "#eff6fa",
  100: "#aed3e4",
  200: "#2f99ca",
  300: "#1b7eab",
  400: "#166e96",
  500: "#125e81",
  600: "#0c5272",
  700: "#074663",
  800: "#03415d",
  900: "#002637",
  DEFAULT: "#125e81",
  // primary.main darkened 10% the way MUI's `darken()` does it, which is what
  // the portal footer uses for its lower bar.
  shade: "#105474",
} as const;

export const ink = {
  50: "#f4f5f7",
  100: "#d1d1d1",
  200: "#7a818f",
  300: "#57647f",
  400: "#4b5772",
  500: "#404b63",
  600: "#34405a",
  700: "#293651",
  800: "#22304e",
  900: "#131e34",
  DEFAULT: "#404b63",
} as const;

/**
 * The portal's card chrome, taken from a rendered study card on
 * nf.synapse.org: `.SRC-portalCard` is a square 1px border with no shadow. A
 * true neutral rather than anything from the `ink` ramp, which is blue-tinted.
 */
export const card = {
  line: "#dddddf",
} as const;

export const BRAND_PRIMARY = brand.DEFAULT;
