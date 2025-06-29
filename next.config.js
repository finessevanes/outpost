const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add Node.js polyfills required by AIR Kit
    config.plugins.push(
      new NodePolyfillPlugin({
        additionalAliases: [
          "buffer",
          "crypto",
          "assert",
          "http",
          "https",
          "os",
          "url",
          "zlib",
          "stream",
          "_stream_duplex",
          "_stream_passthrough",
          "_stream_readable",
          "_stream_writable",
          "_stream_transform",
          "process",
        ],
      })
    );

    return config;
  },
};

module.exports = nextConfig;
