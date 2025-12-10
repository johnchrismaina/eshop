//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
// const path = require('path');
// const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use this to set Nx-specific options
  // See: https://nx.dev/recipes/next/next-config-setup

  // nx: {},
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        hostname: 'ik.imagekit.io',
      },
    ],
  },

  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      packages: path.resolve(__dirname, '../../packages'),
    };
    return config;
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  // withNx,
];

// module.exports = composePlugins(...plugins)(nextConfig);

module.exports = nextConfig;
