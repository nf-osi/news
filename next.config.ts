import type { NextConfig } from "next";
import { basePath } from "./src/lib/base-path";

// Deployed to GitHub Pages at https://news.nf.synapse.org/, served from the
// domain root (see src/lib/base-path.ts).
const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: {
    // GitHub Pages has no image optimization server.
    unoptimized: true,
  },
};

export default nextConfig;
