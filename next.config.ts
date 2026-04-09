import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  typescript: {
    // We'll fix all type errors — but don't block dev server
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
