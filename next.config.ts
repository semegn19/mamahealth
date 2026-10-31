import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The sandbox preview proxies the dev server from a different host, so the
  // dev-only cross-origin check has to allow those origins.
  allowedDevOrigins: [
    "*.e2b.app",
    "*.arena.site",
    "localhost",
    "127.0.0.1",
  ],

  // Keep production builds out of `.next` while `next dev` is running — sharing
  // one output dir leaves the dev server serving stale manifests/chunks.
  // `npm run build` sets NEXT_DIST_DIR=.next-build.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
