import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Ensure calendar CSS loads correctly
  transpilePackages: ['react-big-calendar'],
};

export default nextConfig;
