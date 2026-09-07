import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // turbopack.root = "./",
  output: 'standalone',
  // Type-checking + linting during `next build` is the step that OOMs on
  // low-RAM (1GB) VPS deploys — the compile itself succeeds fine, then a
  // separate tsc worker re-checks the whole project and needs more heap
  // than the box has. Run `npm run lint` / `tsc --noEmit` locally or in CI
  // instead, and skip both here so the production build only compiles.
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
