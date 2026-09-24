/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['puppeteer-core', '@sparticuz/chromium', '@prisma/client'],
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
