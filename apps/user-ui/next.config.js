const path = require('path');
const { composePlugins, withNx } = require('@nx/next');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { hostname: 'ik.imagekit.io' },
      { hostname: 'images.unsplash.com' },
      { hostname: 'localhost' },
    ],
  },
  transpilePackages: ['@eshop/utils'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@eshop/utils/kafka': path.resolve(
        __dirname,
        '../../packages/utils/kafka/index.ts'
      ),
      '@eshop/utils': path.resolve(__dirname, '../../packages/utils'),
    };
    return config;
  },
};

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

module.exports = composePlugins(withNx, withPWA)(nextConfig);
