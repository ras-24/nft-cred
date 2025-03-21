/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  reactStrictMode: true,
  experimental: {
    swcPlugins: [
      ['next-superjson-plugin', {}]
    ]
  }
};

module.exports = nextConfig;
