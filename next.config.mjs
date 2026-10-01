/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Cap the build worker pool. This machine has 12 CPUs but only ~8 GB RAM
    // (often <2 GB free). Defaults spawn 4 static-gen workers + Turbopack's
    // native pool, and under memory pressure V8 workers die with Windows
    // fail-fast 0xC0000409 (STATUS_STACK_BUFFER_OVERRUN), intermittently
    // crashing `next build` at static-page generation. Two workers are
    // enough for this app's route count and drastically cut peak RSS.
    cpus: 2,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: 'jgvme0-av.myshopify.com',
      },
      {
        protocol: 'https',
        hostname: 'lisascustomkeychains.myshopify.com',
      },
      {
        protocol: 'https',
        hostname: 'lisascustomkeychains.com',
      },
    ],
  },
};

export default nextConfig;

