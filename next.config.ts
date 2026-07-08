import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  eslint: {
    // We manage ESLint separately; don't block builds on warnings
    ignoreDuringBuilds: true,
  },
  images: {
    // Required for output: 'export'. Next.js Image Optimization API requires a Node.js server.
    // Static HTML export doesn't run a server, so we must disable optimization.
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year cache for optimized images
    remotePatterns: [
      { protocol: 'https', hostname: 'zrwhcwwawgbimifagjsb.supabase.co' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'beacon-820a0.firebasestorage.app' },
      { protocol: 'https', hostname: 'images.unsplash.com' }
    ],
  },

  experimental: {
    reactCompiler: true,
  },
};

export default nextConfig;
