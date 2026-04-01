import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    // We'll fix all type errors — but don't block dev server
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
