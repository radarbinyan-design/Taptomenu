/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignore ESLint errors during build (warnings allowed)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignore TypeScript errors during build for faster dev
  typescript: {
    ignoreBuildErrors: true,
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
      { protocol: 'https', hostname: 'oaidalleapiprodscus.blob.core.windows.net' },
      { protocol: 'https', hostname: '*.openai.com' },
      { protocol: 'https', hostname: '*.cloudinary.com' },
    ],
  },
};

export default nextConfig;
