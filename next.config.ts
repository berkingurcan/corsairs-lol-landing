import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Every route is static — there is no data source at request time.
  output: "export",
  images: { unoptimized: true },
  trailingSlash: false,
  // This directory is its own project; without it Turbopack walks up and picks
  // a lockfile from the home directory as the workspace root.
  turbopack: { root: path.resolve(import.meta.dirname) },
};

export default nextConfig;
