import type { NextConfig } from "next";
import { basePath } from "./src/lib/base-path";

// Deployed to GitHub Pages at https://nf-osi.github.io/news/.
// TODO: drop basePath (and the CNAME-based custom domain setup) once this
// site moves to a custom domain.
const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: {
    // GitHub Pages has no image optimization server.
    unoptimized: true,
  },
};

export default nextConfig;
