import type { NextConfig } from "next";

const IMG_DIRS = ["hero", "portfolio", "brands", "tech"];

const nextConfig: NextConfig = {
  // Hrefs are built from dynamic locale segments (`/${locale}#...`), so we opt
  // out of typed routes to keep those template-literal links ergonomic.
  typedRoutes: false,
  // Self-contained server bundle for the production Docker image.
  output: "standalone",
  // Formatos modernos cuando se adopte next/image (sharp ya está en la imagen).
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
  },
  // Cache agresivo e inmutable para los assets de imagen.
  async headers() {
    return IMG_DIRS.map((dir) => ({
      source: `/${dir}/:path*`,
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    }));
  },
};

export default nextConfig;
