/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignore ESLint errors during build (warnings allowed)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignore TypeScript errors during build for faster CI
  typescript: {
    ignoreBuildErrors: false,
  },
  // Experimental: allow server components to use sharp
  experimental: {
    serverComponentsExternalPackages: ['sharp', 'prisma', '@prisma/client'],
  },
  // Image optimization
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'tapmenu.am' },
    ],
  },
};

export default nextConfig;
