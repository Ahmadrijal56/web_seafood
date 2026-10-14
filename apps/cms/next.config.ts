import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@sfs/shared"],
  images: {
    // Gambar sudah dikompres ke WebP saat upload/seed.
    unoptimized: true,
  },
};

export default nextConfig;
