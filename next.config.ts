import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hrefs are built from dynamic locale segments (`/${locale}#...`), so we opt
  // out of typed routes to keep those template-literal links ergonomic.
  typedRoutes: false,
  // Self-contained server bundle for the production Docker image.
  output: "standalone",
};

export default nextConfig;
