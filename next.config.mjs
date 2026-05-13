import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
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

