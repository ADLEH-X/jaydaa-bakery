/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['puppeteer-core', '@sparticuz/chromium', '@prisma/client', 'prisma'],
    outputFileTracingIncludes: {
      '/**': ['./prisma/**/*'],
    },
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
