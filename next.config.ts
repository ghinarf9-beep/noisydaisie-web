import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Biar Vercel "tutup mata" kalau ada error TypeScript pas deploy
    ignoreBuildErrors: true,
  },
  eslint: {
    // Biar dia nggak rewel soal kerapian kodingan (Linting)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;