import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  // TODO: Static Export Architecture Notes:
  // - AI/CV analysis requires secure access to GEMINI_API_KEY. Implement via Supabase Edge Function or Firebase Cloud Function. Do NOT expose to client.
  // - Quiz grading should be done via Cloud Function or trusted server-side function to keep `system/quiz_answer_keys` secure.
  // - Admin custom claim updates must be done via Admin SDK / Cloud Function.
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
